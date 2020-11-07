const OAuth = require("oauth");
const axios = require("axios");

const {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_API_ACCESS_TOKEN,
  TWITTER_API_ACCESS_TOKEN_SECRET,
} = process.env;

/**
 * Fetch an access token. They do not explicitly expire.
 * See : https://developer.twitter.com/en/docs/authentication/faq#:~:text=Technical,if%20Twitter%20suspends%20an%20application.
 */
async function authenticateV2() {
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

function authenticate() {
  var oauth = new OAuth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    TWITTER_API_KEY,
    TWITTER_API_SECRET_KEY,
    "1.0A",
    null,
    "HMAC-SHA1"
  );

  return oauth;
}

module.exports.authenticate = authenticate();
module.exports.authenticateV2 = authenticateV2();

/**
 * Fetches Twitter's Places
 */
module.exports.getPlaces = async function () {
  try {
    const client = authenticate();

    return new Promise((resolve, reject) => {
      client.get(
        // "https://api.twitter.com/1.1/trends/place.json?id=23424977",
        "https://api.twitter.com/1.1/trends/available.json",
        TWITTER_API_ACCESS_TOKEN, //test user token
        TWITTER_API_ACCESS_TOKEN_SECRET, //test user secret
        function (e, data, res) {
          if (e) reject(e);
          return resolve(data);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};

module.exports.getTrendsNearLocation = async function (woeid) {
  try {
    const client = authenticate();

    return new Promise((resolve, reject) => {
      client.get(
        // "https://api.twitter.com/1.1/trends/place.json?id=23424977",
        `https://api.twitter.com/1.1/trends/place.json?id=${woeid}`,
        TWITTER_API_ACCESS_TOKEN, //test user token
        TWITTER_API_ACCESS_TOKEN_SECRET, //test user secret
        function (e, data, res) {
          if (e) reject(e);
          return resolve(data);
        }
      );
    });
  } catch (e) {
    throw e;
  }
};
