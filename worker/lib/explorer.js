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
 * Step 2 of 2: Returns Google Trends Explorer data, given a set of daily
 * trending items
 *
 * @param {*} dailyTrends
 */
module.exports.getExplorerTrends = async (dailyTrends) => {
  // get the most recent trending searches from the given daily trends response
  const dt = dailyTrends.default?.trendingSearchesDays?.[0]?.trendingSearches;

  if (!dt) {
    console.warn("No daily trends -- cannot explore them.");
    return null;
  }

  // for each trending item (from today)
  for (const [index, value] of dt.entries()) {
    let keyword = value.title.query;
    const trendingRank = index + 1;

    if (trendingRank > TRENDING_LIMIT) {
      console.warn(
        `Breaking prematurely: TRENDING LIMIT [${TRENDING_LIMIT}] exceeded, currently: ${trendingRank}`
      );
      break;
    }

    debug(`Trending #[${trendingRank}]`, keyword);

    /*
    query the Explorer API for the token used by the 'fe_geo_chart_explore'
    widget. This is downloaded as a text file
    */
    const exploreUri = getUri(keyword);

    // fetch the token needed for the google trending api
    try {
      const memoryStoreKey = `ExploreApiBuffer${index + 1}`;
      const wstream = new utils.WriteableMemoryStream(memoryStoreKey);
      let compareGeoRequest = {};

      debug("Querying explorer URI:", exploreUri);
      let res = await fetch(exploreUri);

      // if we get http 429, use this hack to get past it (using cached cookie)
      if (res.status === 429) {
        const cookie = res.headers.get("set-cookie").split(";")[0];
        res = await fetch(exploreUri, {
          headers: {
            cookie,
            charset: "utf-8",
          },
        });
      }

      // stream response into memory
      wstream.on("finish", function () {
        try {
          const exploreResponse = utils.getMemoryStoreKeyAsObject(
            memoryStoreKey
          );
          for (const widget of exploreResponse["widgets"]) {
            if (widget.type == GOOGLE_TRENDING_GEO_WIDGET) {
              token = widget.token;
              compareGeoRequest = widget.request;
              break;
            }
          } // end for

          // get the trending geo comparisons
          getComparedGeoTrend({
            compareGeoRequest,
            keyword,
            token,
            trendingRank,
          });
        } catch (e) {
          console.error(e);
        }
      }); // end write stream

      // write response body to the stream
      res.body.pipe(wstream);

      // debugging purposes
      debugExplorerResponse(res, trendingRank);
    } catch (e) {
      console.error("Error fetching explorer", e);
    }
  } // end for

  // *** DOES NOT WORK*** TODO: once completed, return the full memorystore object?
  // WARNING: this is returning null b/c the async for loop is not
  // completing prior to this being returned
  return utils.getMemoryStoreAsObject();
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

/**
 * Will query the ComparedGeo Google Trends API with the given options.
 *
 * Returns a json-ized response from the API
 * @param {*} opts
 */
async function getComparedGeoTrend(opts) {
  const { compareGeoRequest, token, trendingRank } = opts;

  if (!compareGeoRequest || !token || !trendingRank) {
    throw new Error(
      "A required value is not set (compareGeoRequest, token, trendingRank)!"
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

  // download the file
  try {
    const res = await fetch(uri);

    // stream response into memory
    const memoryStoreKey = `ComparedGeoApiBuffer-${trendingRank}`;
    const wstream = new utils.WriteableMemoryStream(memoryStoreKey);

    wstream.on("finish", function () {
      debug("Finished writing to", memoryStoreKey);
    });

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
