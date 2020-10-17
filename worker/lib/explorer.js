const fs = require("fs");
const { resolve } = require("path");
const debug = require("debug")("worker:trends");
const fetch = require("node-fetch");

const utils = require("./utils");
const defaults = require("./defaults");

// only look at top # trends
const TRENDING_LIMIT =
  parseInt(process.env.MAX_TREND_LIMIT) || defaults.MAX_TREND_LIMIT;
// contants used for google trends api requests
const GOOGLE_TRENDING_EXPLORER_URI =
  "https://trends.google.com/trends/api/explore";
const GOOGLE_TRENDING_COMPARE_GEO_URI =
  "https://trends.google.com/trends/api/widgetdata/comparedgeo";
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
// the token used when querying the Google "compared geo" API
let token = "";

/*******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Step 2 of 3: Returns Google Trends Explorer data, given a set of daily
 * trending items
 *
 * @param {*} dailyTrends
 */
module.exports.exploreTrends = async (dailyTrends) => {
  // get the most recent trending searches from the given daily trends response
  const dt = dailyTrends.default?.trendingSearchesDays?.[0]?.trendingSearches;

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
    await exploreTrend(exploreUri, memoryStoreKey);
  } // end for

  // *** DOES NOT WORK*** TODO: once completed, return the full memorystore object?
  // WARNING: this is returning null b/c the async for loop is not
  // completing prior to this being returned
  // return utils.getMemoryStoreAsObject();
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
    try {
      const wstream = new utils.WriteableMemoryStream(memoryStoreKey);
      let compareGeoRequest = {};

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
        res = await fetch(exploreUri, {
          headers: {
            cookie,
            charset: "utf-8",
          },
        });
      }

      // stream response into memory
      wstream.on("finish", async function () {
        try {
          // get the response we just wrote to the memory store
          const exploreResponse = utils.getMemoryStoreKeyAsObject(
            memoryStoreKey
          );

          // parse the response body for a token
          for (const widget of exploreResponse["widgets"]) {
            if (widget.type == GOOGLE_TRENDING_GEO_WIDGET) {
              token = widget.token;
              compareGeoRequest = widget.request;
              break;
            }
          } // end for

          // use this token to get the trending geo comparisons
          await getComparedGeoTrend({
            compareGeoRequest,
            token,
            memoryStoreKey,
          });
        } catch (e) {
          console.error(e);
        }
      }); // end write stream

      // write response body to the stream
      res.body.pipe(wstream);

      // debugging purposes
      debug(`TRENDING [${memoryStoreKey}]`, res);
    } catch (e) {
      console.error("Error fetching explorer", e);
    }
}

/**
 * Will query the ComparedGeo Google Trends API with the given options.
 *
 * Returns a json-ized response from the API
 * @param {*} opts
 */
async function getComparedGeoTrend(opts) {
  const { compareGeoRequest, token, memoryStoreKey } = opts;

  if (!compareGeoRequest || !token || !memoryStoreKey) {
    throw new Error(
      "A required value is not set (compareGeoRequest, token, memoryStoreKey)!"
    );
  }

  // build the uri
  const uri =
    GOOGLE_TRENDING_COMPARE_GEO_URI +
    utils.getQueryString({
      req: compareGeoRequest,
      token,
    });

  debug("Compared Geo URI", uri);

  try {
    // get / download the file
    const res = await fetch(uri);

    // stream response into memory
    const wstream = new utils.WriteableMemoryStream(memoryStoreKey);

    // TODO: when this is complete, we ultimately need to return it to the
    // line that invokes `await explorer.exploreTrends(dailyTrends)`
    wstream.on("finish", function () {
      debug(`Finished writing to memoryStore[${memoryStoreKey}]`);
    });

    // write it to our memory store
    res.body.pipe(wstream);

    if (process.env.NODE_ENV == "debug") {
      const dest = fs.createWriteStream(resolve(__dirname));
      res.body.pipe(dest);
    }
  } catch (e) {
    console.error("Error fetching Compared Geo", e);
  }
}

async function storeGeoMapData(data) {
  /*
    TODO: 
      - store this
      - once all trending topics are stored, determine the top 3 trending
      topics per "state"!
  */
  debug(data);
}

function debugExplorerResponse(explorerAPIResponse, trendingRank) {
  if (process.env.NODE_ENV == "development") {
    // write explorer response to file system
    const dest = fs.createWriteStream(
      resolve(__dirname, `../debug`, `${trendingRank}-explorer.txt`)
    );

    // pipe response into the file
    explorerAPIResponse.body.pipe(dest);
  }
}
