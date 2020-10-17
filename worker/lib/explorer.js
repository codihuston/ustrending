const fs = require("fs");
const path = require("path");
const debug = require("debug")("worker:explorer");
const fetch = require("node-fetch");

const utils = require("./utils");
const defaults = require("./defaults");

// only look at top # trends
const TRENDING_LIMIT =
  parseInt(process.env.MAX_TREND_LIMIT) || defaults.MAX_TREND_LIMIT;
// contants used for google trends api requests
const GOOGLE_TRENDING_EXPLORER_URI =
  "https://trends.google.com/trends/api/explore";
const GOOGLE_TRENDING_GEO_WIDGET = "fe_geo_chart_explore";
// shows trending for current trending topic for this country, see:
// https://developers.google.com/adwords/api/docs/appendix/geotargeting
const GOOGLE_GEO_COUNTRY_CODE =
  process.env.GOOGLE_GEO_COUNTRY_CODE || defaults.GOOGLE_GEO_COUNTRY_CODE;
const GOOGLE_HOST_LANGUAGE =
  process.env.GOOGLE_HOST_LANGUAGE || defaults.GOOGLE_HOST_LANGUAGE;
const GOOGLE_TIME_ZONE =
  process.env.GOOGLE_TIME_ZONE || defaults.GOOGLE_TIME_ZONE;
const GOOGLE_GEO_TIME_RANGES =
  process.env.GOOGLE_GEO_TIME_RANGES || defaults.GOOGLE_GEO_TIME_RANGES;
// the token used when querying the Google "ComparedGeo" widget data API
let token = "";

/*******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Step 2 of 5: Returns Google Trends Explorer data, given a set of daily
 * trending items. This response data (along with supplemental data) will
 * be used to fetch the geographic data for each of the trends (i.e. the
 * trending data for each trend by region)
 * 
 * @param {*} dailyTrends 
 * @returns [<promise>{
 *  exploreResponse,
 *  comparedGeoRequest,
 *  token,
 *  memoryStoreKey
 * }]
 */
module.exports.exploreTrends = async (dailyTrends) => {
  // get the most recent trending searches from the given daily trends response
  const dt = dailyTrends.default?.trendingSearchesDays?.[0]?.trendingSearches;
  const promises = [];

  if (!dt) {
    console.warn("No daily trends -- cannot explore them.");
    return null;
  }

  // for each trending item (from today)
  for (const [index, value] of dt.entries()) {
    const keyword = value.title.query;
    const exploreUri = getUri(keyword);
    const trendingRank = index + 1;
    const memoryStoreKey = `#${trendingRank}: ${keyword}`;

    if (trendingRank > TRENDING_LIMIT) {
      console.warn(
        `Breaking prematurely: TRENDING LIMIT [${TRENDING_LIMIT}] exceeded, currently: ${trendingRank}`
      );
      break;
    }

  /*
  query the Explorer API for the token used by the 'fe_geo_chart_explore'
  widget. This is downloaded as a text file
  */
   promises.push(exploreTrend(exploreUri, memoryStoreKey));
  } // end for

  // after all trends have been explored, run comparedGeo()?
  return Promise.all(promises);
};

/*******************************************************************************
 * Private API
 ******************************************************************************/

function getUri(keyword) {
  return (
    GOOGLE_TRENDING_EXPLORER_URI +
    "?" +
    utils.getQueryString({
      hl: GOOGLE_HOST_LANGUAGE,
      tz: GOOGLE_TIME_ZONE,
      req: {
        geo: {
          country: GOOGLE_GEO_COUNTRY_CODE,
        },
        comparisonItem: [
          {
            keyword: keyword,
            geo: GOOGLE_GEO_COUNTRY_CODE,
            time: GOOGLE_GEO_TIME_RANGES,
          },
        ],
      },
      category: 0,
      property: "",
    })
  );
}

async function exploreTrend(exploreUri, memoryStoreKey){
  return new Promise(async (resolve, reject)=> {
    let comparedGeoRequest = {};
    const wstream = new utils.WriteableMemoryStream(memoryStoreKey);

    // event callback for streaming response data into memory
    wstream.on("finish", async function () {
      try {
        // get the response we just wrote to the memory store
        const exploreResponse = utils.getMemoryStoreKeyAsObject(
          memoryStoreKey
        );

        // parse response body for a token and gep request data for this item
        for (const widget of exploreResponse["widgets"]) {
          if (widget.type == GOOGLE_TRENDING_GEO_WIDGET) {
            token = widget.token;
            comparedGeoRequest = widget.request;
            break;
          }
        } // end for

        resolve({
          exploreResponse,
          comparedGeoRequest,
          token,
          memoryStoreKey
        });
      } catch (e) {
        // console.error(e);
        reject(e);
      }
    }); // end write stream

    // fetch the token needed for the google trending api
    debug("Querying explorer URI:", exploreUri);
    let res = await fetch(exploreUri);

    /**
     * IMPORTANT: This will always be true!
     * 
     * If we get http 429, use this hack to get past it (using cookie obtained
     * from the request above). This happens then the API receieves a request
     * without a cookie that their servers set in our sessions. 
     * 
     * The only way to get this cookie is to get a failing response from the
     * first attempt. If the 3rd party library 'google-trends-api' allowed
     * me to get the headers from the requests it uses, then I could
     * probably use that instead of having to rely on a bad request like I
     * am doing now.
     */
    if (res.status === 429) {
      console.warn("WARNING: Google Trends API returned 429, re-attempting with cookie from first attempt request!");

      const cookie = res.headers.get("set-cookie").split(";")[0];

      // send request -> responds with a BUFFER (containing JSON data)
      res = await fetch(exploreUri, {
        headers: {
          cookie,
          charset: "utf-8",
        },
      });
    }

    // write response body to the stream
    res.body.pipe(wstream);

    debugExplorerResponse(res, memoryStoreKey);
  });
}

function debugExplorerResponse(explorerAPIResponse, trendingRank) {
  if (process.env.NODE_ENV == "development") {
    const outputPath = path.resolve(__dirname, `../debug`, `${trendingRank}-explorer.txt`);
    debug("DEBUG: Writing output...", results.keys());

    // write explorer response to file system
    const dest = fs.createWriteStream(outputPath);

    // pipe response into the file
    explorerAPIResponse.body.pipe(dest);
  }
}
