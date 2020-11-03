const OAuth = require("oauth");

/**
 * Generates a URI to use when querying the YAHOO WEATHER API,
 * built using WOEID
 *
 * @param String
 */
module.exports.getUriByWoeid = function (woeid) {
  // const API_ENDPOINT = `https://weather-ydn-yql.media.yahoo.com/forecastrss?location=<CITY>,<STATE>&format=json`;
  const API_ENDPOINT =
    "https://weather-ydn-yql.media.yahoo.com/forecastrss?woeid=<WOEID>&format=json";

  const uri = API_ENDPOINT.replace("<WOEID>", woeid);

  if (!woeid) {
    return "";
  }
  return uri;
};

/**
 * Generates a URI to use when querying the YAHOO WEATHER API,
 * built using a given city / state
 *
 * @param {*} city  : census place
 * @param {*} state : census state
 */
module.exports.getUriByCityState = function (city, state) {
  const API_ENDPOINT = `https://weather-ydn-yql.media.yahoo.com/forecastrss?location=<CITY>,<STATE>&format=json`;

  const uri = API_ENDPOINT.replace("<WOEID>", woeid);

  if (!city) {
    return [];
  }
  return uri;
};

/**
 * Will query the Yahoo Weather API with a given city and state (as defined
 * by the Census API response for any given place).
 *
 * If an error occurs in this query, it will not halt the processing of cities
 * following this one, but an error will be logged.
 *
 * TODO: account for all of the cities that had erroneous responses? Since
 * I expect to have ~2500k+ cities, missing a few here and there shouldn't be
 * a huge issue...
 *
 * @param {*} city
 * @returns [YAHOO_API_RESPONSE, YAHOO_API_ENDPOINT]
 */
module.exports.getForecast = function (uri) {
  const header = {
    "X-Yahoo-App-Id": process.env.YAHOO_APP_ID,
  };
  const request = new OAuth.OAuth(
    null,
    null,
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_SECRET,
    "1.0",
    null,
    "HMAC-SHA1",
    null,
    header
  );

  try {
    // TODO: need to handle errors a little more gracefully
    // Also, it may be worth caching which queries/cities failed
    return new Promise((resolve, reject) => {
      request.get(
        //"https://weather-ydn-yql.media.yahoo.com/forecastrss?location=los angeles,california&format=json",
        // "https://weather-ydn-yql.media.yahoo.com/forecastrss?location=Louisville/Jefferson County metro government (balance)&format=json",
        uri,
        null,
        null,
        function (err, data, result) {
          if (err) {
            // continue processing the rest of the cities on error
            console.error(err);
            reject(err);
          } else {
            if (!data || typeof data === undefined) {
              resolve(null);
            }
            resolve(JSON.parse(data));
          }
        }
      );
    });
  } catch (e) {
    // continue processing the rest of the cities on error
    console.error(e);
    return null;
  }
};
