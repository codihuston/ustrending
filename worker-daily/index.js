const googleTrends = require('google-trends-api');
const fs = require('fs');
const fetch = require("node-fetch");
const stream = require("stream");
const util = require('util');
const { memory } = require('console');
const Writable = stream.Writable || require('readable-stream').Writable

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
    
    // get the search query used for this trending item
    let keyword = trendingResponse.default.trendingSearchesDays[0].trendingSearches[0].title.query;
    // keyword = "Washington Redskins";

    console.log("trendingResponse", trendingResponse);
    console.log("search query", keyword);

    /*
    TODO: get token from:
    https://trends.google.com/trends/api/explore?hl=en-US&tz=300&req=%7B%22comparisonItem%22:%5B%7B%22keyword%22:%22Washington+Redskins%22,%22geo%22:%22US%22,%22time%22:%22now+7-d%22%7D%5D,%22category%22:0,%22property%22:%22%22%7D&tz=300
    widgets[N].token where widgets[N].type = 'fe_geo_chart_explore'

    This is also downloaded as a text file
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

    console.log("Explore URI:", exploreUri);

    // Fetch the token needed for the google trending api
    try{
      const memoryStoreKey = 'ExploreApiBuffer';
      const wstream = new WriteableMemoryStream(memoryStoreKey);
      let compareGeoRequest = {};

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
        const exploreResponse = getMemoryStoreKeyAsJson(memoryStoreKey);
        for(const widget of exploreResponse['widgets']){
          if(widget.type == GOOGLE_TRENDING_GEO_WIDGET){
            token = widget.token;
            compareGeoRequest = widget.request;
            break;
          }
        }

        getComparedGeoTrend({compareGeoRequest, keyword, token});
      });

      res.body.pipe(wstream);

      // TODO: parse file (the first line is throwing off the parser) to
      // get the token needed for the next http request
    }catch(e){
      console.error("Error fetching explorer", e);
    }
  }
});

async function getComparedGeoTrend(opts){
  const { compareGeoRequest, token} = opts;

  if(!compareGeoRequest || !token){
    throw new Error("A required value is not set (ht, tz, keyword, token)!");
  }

   const uri = GOOGLE_TRENDING_COMPARE_GEO_URI + getQueryString({
    req: compareGeoRequest,
    token
  });

  console.log("Compared Geo URI", uri);

  // download the file
  try{
    const res = await fetch(uri);

    // stream response into memory
    const memoryStoreKey = 'ComparedGeoApiBuffer';
    const wstream = new WriteableMemoryStream(memoryStoreKey);

    wstream.on('finish', function(){
      console.log("Finished writing to", memoryStoreKey)
      storeGeoMapData(getMemoryStoreKeyAsJson(memoryStoreKey));
    });

    res.body.pipe(wstream);
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