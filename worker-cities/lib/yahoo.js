const OAuth = require("oauth");

var header = {
  "X-Yahoo-App-Id": process.env.YAHOO_APP_ID,
};

var request = new OAuth.OAuth(
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

/**
 * TODO:
 * - for each US state in ./debug/usa-cities.json
 *  - send a request to yahoo
 *  - using its response, save the:
 *    - city name (full)
 *    - city long
 *    - city lat
 *    - city timezone_id
 *    - state full name
 *    - state abbreviation
 *    - woeid
 */

request.get(
  //"https://weather-ydn-yql.media.yahoo.com/forecastrss?location=los angeles,california&format=json",
  "https://weather-ydn-yql.media.yahoo.com/forecastrss?location=Louisville/Jefferson County metro government (balance)&format=json",
  null,
  null,
  function (err, data, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  }
);
