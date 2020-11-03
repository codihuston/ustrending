const OAuth = require("oauth");
const fetch = require("node-fetch");

const utils = require("./utils");
const worldwide_trends = require("../debug/twitter-trends-us.json");

async function authenticate() {
  var OAuth2 = OAuth.OAuth2;
  const { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } = process.env;
  var oauth2 = new OAuth2(
    TWITTER_API_KEY,
    TWITTER_API_SECRET_KEY,
    "https://api.twitter.com/",
    null,
    "oauth2/token",
    null
  );
  return new Promise((resolve, reject) => {
    oauth2.getOAuthAccessToken(
      "",
      { grant_type: "client_credentials" },
      function (error, access_token, refresh_token, results) {
        if (error) {
          reject(error);
        }
        resolve(access_token);
      }
    );
  });
}

module.exports.authenticate = authenticate;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// module.exports.getTrendsByPlace = async function (twitterMap) {
module.exports.getTrendsByPlace = async function (twitterMap) {
  const CACHE_KEY_PREFIX = "worker-twitter:"; // - woeid
  const API_ENDPOINT =
    "https://api.twitter.com/1.1/trends/place.json?id=<WOEID>";
  const MAX_TRENDS = 10;
  const access_token = await authenticate();

  console.log(access_token);

  /**
   * STEP 1: top trends in the US on a delta (woeid: 23424977)
   */
  console.log("Begin looking at us trends");

  /**
   * STEP 2: create rules
   * - get tweets from all states
   *
   * https://developer.twitter.com/en/docs/twitter-api/rate-limits
   * https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule
   *
   * "Note that beyond these limits on the number of requests, the Standard
   * Basic level of access provides up to 500,000 Tweets per month from the
   * recent search and filtered stream endpoints. If you have exceeded the
   * monthly  limit on the number of Tweets, then it makes more sense for your
   * app to raise a notification and know its enrollment day of the month and
   * hold off requests until that day."
   */
  // let ruleset = [];
  // for (let i = 0; i < MAX_TRENDS; i++) {
  //   const rule = "";
  //   console.log(`Examining trend #${i + 1}`, worldwide_trends[0].trends[i]);
  // }

  /**
   * STEP 3: set rules in twitter API
   * - get tweets from all states
   */

  /**
   * STEP 4: read from stream / store in memory
   * - get tweets from all states
   */
  fetch("https://stream.twitter.com/1.1/statuses/filter.json");

  /**
   * STEP 5: in another multi-threaded process, unbox, increment tweet count
   * by state, store result in memory. Publish, clients update map accordingly.
   *
   * TODO: figure out how to safely queue/process/write all of this data
   * - https://redis.io/topics/distlock
   * - https://github.com/go-redsync/redsync
   * - https://github.com/mike-marcacci/node-redlock
   */
};
