const fs = require("fs");
const { resolve } = require("path");
const debug = require("debug")("worker:trends");
const googleTrends = require("google-trends-api");

// shows trending for current trending topic for this country, see:
// https://developers.google.com/adwords/api/docs/appendix/geotargeting
const GOOGLE_GEO_COUNTRY_CODE = process.env.GOOGLE_GEO_COUNTRY_CODE || "US";

/*******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Step 1 of 2: Returns Google Trends trending item data
 */
module.exports.getDailyTrends = async () =>
  googleTrends.dailyTrends(
    { geo: GOOGLE_GEO_COUNTRY_CODE },
    dailyTrendsCallback
  ); // end daily trends

/*******************************************************************************
 * Private API
 ******************************************************************************/
/**
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

    debugTrendingResponse(trendingResponse);

    return trendingResponse;
  } // end else
}

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
function debugTrendingResponse(trendingAPIResponse) {
  if (process.env.NODE_ENV == "development") {
    // write trending response to file system
    fs.writeFileSync(
      resolve(__dirname, `../debug`, "_trendingAPIResponse.json"),
      JSON.stringify(trendingAPIResponse, null, 4)
    );
  }
}