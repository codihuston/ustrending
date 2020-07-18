const googleTrends = require('google-trends-api');
const fs = require('fs');
const fetch = require("node-fetch");
const {resolve} = require("path");
const stream = require("stream");
const util = require('util');
const Writable = stream.Writable || require('readable-stream').Writable

// only look at top 10 trends
const TRENDING_LIMIT = 20;
// contants used for google trends api requests
const GOOGLE_TRENDING_EXPLORER_URI = 'https://trends.google.com/trends/api/explore';
const GOOGLE_TRENDING_COMPARE_GEO_URI = 'https://trends.google.com/trends/api/widgetdata/comparedgeo';
const GOOGLE_TRENDING_GEO_WIDGET = 'fe_geo_chart_explore';
// shows trending for current trending topic this country: https://developers.google.com/adwords/api/docs/appendix/geotargeting
const GOOGLE_GEO_COUNTRY_CODE = "US";
const hl = "en-US";
const tz = 300;
// a memory store buffer consisting of google trending api responses
const memoryStore = {};
// the token used to query the Google "compared geo" API
let token = "";

function getMemoryStoreKey(key){
  return memoryStore[key].toString().replace(/.*\n/, "");
}

function getMemoryStoreKeyAsJson(key){
  return JSON.parse(getMemoryStoreKey(key));
}

/* Writable memory stream */
function WriteableMemoryStream(key, options) {
  // allow use without new operator
  if (!(this instanceof WriteableMemoryStream)) {
    return new WriteableMemoryStream(key, options);
  }
  Writable.call(this, options); // init super
  this.key = key; // save key
  memoryStore[key] = Buffer.from([]); // empty
}
util.inherits(WriteableMemoryStream, Writable);

WriteableMemoryStream.prototype._write = function (chunk, enc, cb) {
  // our memory store stores things in buffers
  var buffer = (Buffer.isBuffer(chunk)) ?
    chunk :  // already is Buffer use it
    Buffer.from(chunk, enc);  // string, convert

  // concat to the buffer already there
  memoryStore[this.key] = Buffer.concat([memoryStore[this.key], buffer]);
  cb();
};

function getQueryString(opts){
  /**
   * builds the querystring used to sent to the google trending API
   * 
   */

  let queryString = `?`;

  console.log("Given options", opts);

  for(const [key, value] of Object.entries(opts)){
    // encoding json object
    if(typeof value === "object"){
      queryString += `${key}=${encodeURIComponent(JSON.stringify(value))}&`
    }
    else{
      queryString += `${key}=${value}&`
    }
  }
  return queryString;
}

googleTrends.dailyTrends({ geo: "US" }, async function(err, results){
  if(err){
    console.error(err);
  }else{
    const trendingResponse = JSON.parse(results);

    console.log("trendingResponse", trendingResponse);
    
    // for each trending search (from today)
    for(const [index, value] of trendingResponse.default.trendingSearchesDays[0].trendingSearches.entries()){
      let keyword = value.title.query;
      const trendingRank = index + 1;

      if(index > TRENDING_LIMIT - 1) break;

      console.log(`Trending #[${trendingRank}]`, keyword);

      /*
      query the Explorer API for the token used by the 'fe_geo_chart_explore'
      widget. This is downloaded as a text file
      */
      const exploreUri = GOOGLE_TRENDING_EXPLORER_URI + "?" + getQueryString({
        hl, 
        tz, 
        req: {
          "geo": {
            "country": GOOGLE_GEO_COUNTRY_CODE
          },
          "comparisonItem": [      
            {
            "keyword":keyword,
            "geo": GOOGLE_GEO_COUNTRY_CODE,
            "time":"now 7-d"
            }
          ]
        },
        "category":0,
        "property":""
      });
  
      // fetch the token needed for the google trending api
      try{
        const memoryStoreKey = `ExploreApiBuffer${index+1}`;
        const wstream = new WriteableMemoryStream(memoryStoreKey);
        let compareGeoRequest = {};
  
        console.log("Querying explorer URI:", exploreUri);
        let res = await fetch(exploreUri);
  
        // if we get http 429, use this hack to get past it (using cached cookie)
        if(res.status === 429){
          const cookie = res.headers.get('set-cookie').split(";")[0];
          res = await(fetch(exploreUri, {
            headers: {
              cookie
            }
          }));
        }
  
        // stream response into memory
        wstream.on('finish', function(){
          try{
            const exploreResponse = getMemoryStoreKeyAsJson(memoryStoreKey);
            for(const widget of exploreResponse['widgets']){
              if(widget.type == GOOGLE_TRENDING_GEO_WIDGET){
                token = widget.token;
                compareGeoRequest = widget.request;
                break;
              }
            }
    
            // get the trending geo comparisons
            getComparedGeoTrend({compareGeoRequest, keyword, token, trendingRank});
          }
          catch(e){
            console.error(e);
          }
        });
  
        res.body.pipe(wstream);

        if(process.env.NODE_ENV == "debug"){
          const dest = fs.createWriteStream(resolve(__dirname, `${trendingRank}-explorer.txt`));
          res.body.pipe(dest);
          fs.writeFileSync(resolve(__dirname, "_trendingResponse.json"), JSON.stringify(trendingResponse, null, 4));
        }
      }catch(e){
        console.error("Error fetching explorer", e);
      }
    } // end for 
  } // end else
}); // end daily trends

/**
 * Will query the ComparedGeo Google Trends API with the given options.
 * 
 * Returns a json-ized response from the API
 * @param {*} opts 
 */
async function getComparedGeoTrend(opts){
  const { compareGeoRequest, token, trendingRank} = opts;

  if(!compareGeoRequest || !token || !trendingRank){
    throw new Error("A required value is not set (compareGeoRequest, token, trendingRank)!");
  }

  // build the uri
  const uri = GOOGLE_TRENDING_COMPARE_GEO_URI + getQueryString({
    req: compareGeoRequest,
    token
  });

  console.log("Compared Geo URI", uri);

  // download the file
  try{
    const res = await fetch(uri);

    // stream response into memory
    const memoryStoreKey = `ComparedGeoApiBuffer-${trendingRank}`;
    const wstream = new WriteableMemoryStream(memoryStoreKey);

    wstream.on('finish', function(){
      console.log("Finished writing to", memoryStoreKey)
      storeGeoMapData(getMemoryStoreKeyAsJson(memoryStoreKey));
    });

    res.body.pipe(wstream);

    if(process.env.NODE_ENV == "debug"){
      const dest = fs.createWriteStream(resolve(__dirname, ));
      res.body.pipe(dest);
    }
  }
  catch(e){
    console.error("Error fetching Compared Geo", e)
  }
}

async function storeGeoMapData(data){
  /*
    TODO: 
      - store this
      - once all trending topics are stored, determine the top 3 trending
      topics per "state"!
  */
  console.log(data);
}