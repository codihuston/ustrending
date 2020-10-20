const fs = require("fs");
const { resolve } = require("path");
const debug = require("debug")("worker:trends");
const googleTrends = require("google-trends-api");

const defaults = require("./defaults");

// shows trending for current trending topic for this country, see:
// https://developers.google.com/adwords/api/docs/appendix/geotargeting
const GOOGLE_GEO_COUNTRY_CODE =
  process.env.GOOGLE_GEO_COUNTRY_CODE || defaults.GOOGLE_GEO_COUNTRY_CODE;

/*******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Step 1 of 5: Returns Google Trends trending item data
 */
module.exports.getDailyTrends = async () =>
  googleTrends.dailyTrendsByState(
    { geo: GOOGLE_GEO_COUNTRY_CODE },
    dailyTrendsCallback
  ); // end daily trends

/**
 * TODO: implement realTimeTrends! This needs to be "explored" differently
 * than the Daily Trends, and MAY need to be "ComparedGeo'd" differently
 * as well...
 */
module.exports.realTimeTrends = async () =>
  googleTrends.realTimeTrends(
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

    debugResponse(trendingResponse);

    return trendingResponse;
  } // end else
}

/**
 * Debugging purposes. Writes the responses from the Google Trends API
 * Explorer / Trending to the file system.
 *
 * Note: if using skaffold, this is written to the container, not your host
 * file system!
 * @param {*} trendingAPIResponse
 */
function debugResponse(trendingAPIResponse) {
  if (process.env.NODE_ENV == "development") {
    const outputPath = resolve(
      __dirname,
      `../debug`,
      "google-trends-api-response.json"
    );

    debug("DEBUG: Writing output to: ", outputPath);

    // write trending response to file system
    fs.writeFileSync(outputPath, JSON.stringify(trendingAPIResponse, null, 4));
  }
}
