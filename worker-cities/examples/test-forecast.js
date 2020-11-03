require("dotenv").config();
const OAuth = require("oauth");

async function getForecast() {
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
    const uri =
      "https://weather-ydn-yql.media.yahoo.com/forecastrss?location=Homewood,Alabama&format=json";
    // const uri = API_ENDPOINT.replace("<CITY>", city.censusPlace).replace(
    //   "<STATE>",
    //   city.censusState
    // );
    // debug("Replace with", city.censusPlace, city.censusState);

    debug("Sending response to: ", uri);

    return await new Promise((resolve, reject) => {
      request.get(
        //"https://weather-ydn-yql.media.yahoo.com/forecastrss?location=los angeles,california&format=json",
        // "https://weather-ydn-yql.media.yahoo.com/forecastrss?location=Louisville/Jefferson County metro government (balance)&format=json",
        uri,
        null,
        null,
        function (err, data, result) {
          if (err) {
            debug(err);
            reject(err);
          } else {
            debug("YAHOO DATA", data);
            // debug("YAHOO RESULT", result);
            resolve(data);
          }
        }
      );
    });
  } catch (e) {
    // continue processing the rest of the cities
    console.error(e);
  }
}

getForecast();
