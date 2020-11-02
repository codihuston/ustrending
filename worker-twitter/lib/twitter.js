const OAuth = require("oauth");
const fetch = require("node-fetch");

const utils = require("./utils");

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

  const access_token = await authenticate();

  console.log(access_token);
  // console.log(JSON.stringify([...twitterMap, null, 4]));

  // for (const [state, city] of twitterMap.entries()) {
  //   const uri = API_ENDPOINT.replace("<WOEID>", city.woeid);

  //   console.log("Get trends for:", city);

  //   const result = await fetch(uri, {
  //     method: "get",
  //     headers: {
  //       Authorization: `Bearer ${access_token}`,
  //     },
  //   });

  //   console.log(result, result.status);
  // }
  // const woeid = 2383660; //
  const woeid = 2484654; // rosedale, MD
  const wstream = new utils.WriteableMemoryStream(woeid);
  const uri = API_ENDPOINT.replace("<WOEID>", woeid);
  let promises = [];

  /**
   * TODO: write a rate-limit aware twitter-crawler bot. This
   * needs to do the following:
   *
   * see: https://twittercommunity.com/t/why-does-the-trends-place-json-return-404-sometimes-for-valid-woeids/22068
   *
   * - slowly crawl over all cities
   * - for each city
   *    - check current rate limit headers
   *    - if x-rate-remaining > 0
   *      - query the next city
   *      - if 404, mark it so we never query it again (in mongodb?)
   *      - else if 200, mark it so we DO query it again
   *        - NOTE: IDK if SOME locations WILL get twitter volume, or if they'll
   *          sometimes fall off/come back up, so idk if flagging this is
   *          useful...
   *    - else, sleep for x-rate-reset duration before continuing!
   */
  for (const city of twitterMap) {
    console.log(city);
    const p = new Promise(async (resolve, reject) => {
      wstream.on("finish", async function () {
        try {
          // get the response we just wrote to the memory store
          const response = utils.getMemoryStoreKeyAsObject(woeid);

          console.log(response);

          resolve(response);
        } catch (e) {
          // console.error(e);
          reject(e);
        }
      }); // end write stream

      const res = await fetch(uri, {
        method: "get",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      res.body.pipe(wstream);
      console.log(res.body, res.status, res.headers);
      // res.headers.x-rate-limit
      // res.headers.x-rate-remaining
      // res.headers.x-rate-reset
    }); // end promise
    await sleep(1000);
    promises.push(p);
  }

  console.log(Promise.all(promises));
};
