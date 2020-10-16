const fs = require("fs");
const { resolve } = require("path");
const debug = require("debug")("worker");
const googleTrends = require("google-trends-api");
const fetch = require("node-fetch");

const utils = require("./utils");

// only look at top # trends
const TRENDING_LIMIT = parseInt(process.env.MAX_TREND_LIMIT) || 0;
// contants used for google trends api requests
const GOOGLE_TRENDING_EXPLORER_URI =
  "https://trends.google.com/trends/api/explore";
const GOOGLE_TRENDING_COMPARE_GEO_URI =
  "https://trends.google.com/trends/api/widgetdata/comparedgeo";
const GOOGLE_TRENDING_GEO_WIDGET = "fe_geo_chart_explore";
// shows trending for current trending topic for this country, see:
// https://developers.google.com/adwords/api/docs/appendix/geotargeting
const GOOGLE_GEO_COUNTRY_CODE = "US";
const hl = "en-US";
const tz = 300;
// the token used when querying the Google "compared geo" API
let token = "";

module.exports.getDailyTrends = async () =>
  googleTrends.dailyTrends(
    { geo: GOOGLE_GEO_COUNTRY_CODE },
    dailyTrendsCallback
  ); // end daily trends

/**
 * Debugging purposes. Writes the responses from the Google Trends API
 * Explorer / Trending to the file system.
 *
 * Note: if using skaffold, this is written to the container, not your host
 * file system!
 * @param {*} explorerAPIResponse
 * @param {*} trendingRank
 * @param {*} trendingAPIResponse
 */
function debugTrendingResponse(
  explorerAPIResponse,
  trendingRank,
  trendingAPIResponse
) {
  if (process.env.NODE_ENV == "development") {
    // write explorer response to file system
    const dest = fs.createWriteStream(
      resolve(__dirname, `../debug`, `${trendingRank}-explorer.txt`)
    );

    // pipe response into the file
    explorerAPIResponse.body.pipe(dest);

    // write trending response to file system
    fs.writeFileSync(
      resolve(__dirname, `../debug`, "_trendingAPIResponse.json"),
      JSON.stringify(trendingAPIResponse, null, 4)
    );
  }
}

/**
 * Step 1 of 2: Fetches Google trends data
 *
 * This callback is invoked after fetching all daily trends from today via the
 * google-trends 3rd party library. This function is responsible for recording
 * the response data, staging it for future processing by the next step.
 *
 * @param {*} err
 * @param {*} results
 */
async function dailyTrendsCallback(err, results) {
  if (err) {
    console.error(err);
  } else {
    const trendingResponse = JSON.parse(results);

    debug("trendingResponse", trendingResponse);

    // for each trending search (from today)
    for (const [
      index,
      value,
    ] of trendingResponse.default.trendingSearchesDays[0].trendingSearches.entries()) {
      let keyword = value.title.query;
      const trendingRank = index + 1;

      if (trendingRank > TRENDING_LIMIT) {
        console.warn(`Breaking prematurely: TRENDING LIMIT exceeded: ${index}`);
        break;
      }

      debug(`Trending #[${trendingRank}]`, keyword);

      /*
    query the Explorer API for the token used by the 'fe_geo_chart_explore'
    widget. This is downloaded as a text file
    */
      const exploreUri =
        GOOGLE_TRENDING_EXPLORER_URI +
        "?" +
        utils.getQueryString({
          hl,
          tz,
          req: {
            geo: {
              country: GOOGLE_GEO_COUNTRY_CODE,
            },
            comparisonItem: [
              {
                keyword: keyword,
                geo: GOOGLE_GEO_COUNTRY_CODE,
                time: "now 7-d",
              },
            ],
          },
          category: 0,
          property: "",
        });

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
            },
          });
        }

        // stream response into memory
        wstream.on("finish", function () {
          try {
            const exploreResponse = utils.getMemoryStoreKeyAsJson(
              memoryStoreKey
            );
            for (const widget of exploreResponse["widgets"]) {
              if (widget.type == GOOGLE_TRENDING_GEO_WIDGET) {
                token = widget.token;
                compareGeoRequest = widget.request;
                break;
              }
            }

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
        debugTrendingResponse(res, trendingRank, trendingResponse);
      } catch (e) {
        console.error("Error fetching explorer", e);
      }
    } // end for

    // TODO: once completed, return the full memorystore object?
  } // end else
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
      storeGeoMapData(utils.getMemoryStoreKeyAsJson(memoryStoreKey));
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
