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
const OAuth = require("oauth");

async function getForecast(city) {
  const API_ENDPOINT = `https://weather-ydn-yql.media.yahoo.com/forecastrss?location=<CITY>,<STATE>&format=json`;
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

  if (!city) {
    return null;
  }

  try {
    const uri = API_ENDPOINT.replace("<CITY>", city.censusPlace).replace(
      "<STATE>",
      city.censusState
    );
    console.log("Replace with", city.censusPlace, city.censusState);

    console.log("Sending response to: ", uri);

    return await new Promise((resolve, reject) => {
      request.get(
        //"https://weather-ydn-yql.media.yahoo.com/forecastrss?location=los angeles,california&format=json",
        // "https://weather-ydn-yql.media.yahoo.com/forecastrss?location=Louisville/Jefferson County metro government (balance)&format=json",
        uri,
        null,
        null,
        function (err, data, result) {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            if (data !== "" || typeof data === undefined) {
              const json = JSON.parse(data);

              // TODO: need to handle these errors a little more gracefully
              // Also, it may be worth caching which queries/cities failed
              // if no location data is given, then just return nothing
              if (Object.keys(json.location).length === 0) {
                console.warn("Bad respone data from:", uri);
                return null;
              }
              console.log("YAHOO DATA", data);
              console.log("YAHOO RESULT", result);
              resolve(data);
            } else {
              console.warn("Bad response data from:", uri);
            }
          }
        }
      );
    });
  } catch (e) {
    // continue processing the rest of the cities
    console.error(e);
  }
}

function processResponse(response, city) {
  const obj = {};

  if (!response || !Object.keys(response.location).length === 0) {
    return null;
  }

  try {
    // append census results to it
    obj.population = city.population;
    obj.censusPlaceId = city.censusPlaceId;
    // append yahoo results to it
    obj.city = response.location.city;
    obj.region = response.location.city.trim();
    obj.country = response.location.country;
    obj.timezone_id = response.location.timezone_id;
    obj.long = response.location.long;
    obj.lat = response.location.lat;
    obj.woeid = response.location.woeid;

    return obj;
  } catch (e) {
    console.warn(
      `Failed to process response for census city:`,
      JSON.stringify(city, null, 4),
      ` and yahoo city: `,
      JSON.stringify(response, null, 4)
    );
    console.error(e);
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.getUSCityInformation = async function (
  client,
  cities,
  CACHE_KEY_PREFIX
) {
  const result = new Map();

  // if given cities
  if (cities.length) {
    // get yahoo info for each city
    for (const city of cities) {
      const cacheKey = `${CACHE_KEY_PREFIX}-${city.censusPlaceId}`;
      let response = await client.get(cacheKey);

      // init this key in the map
      if (!result.get(city.censusState)) {
        // init a map key equal to the full name of the state as an array
        result.set(city.censusState, []);
      }

      // if this response is in the cache, reuse it!
      if (response) {
        console.log(
          `CACHE HIT (${cacheKey}): reusing cache for ${city.censusPlaceId}, ${city.censusState}`
        );

        // process it
        const obj = processResponse(JSON.parse(response), city);

        // store it in the map
        obj
          ? result.set(
              city.censusState,
              result.get(city.censusState).concat(obj)
            )
          : "";
      } else {
        // otherwise, query the api
        let response = await getForecast(city);

        if (response.length) {
          // cache weather response (NOTE: response is returned as string)
          // key: cacheKey-${censusPlaceID}
          await client.set(cacheKey, response, "ex", process.env.REDIS_TTL);

          // process the response
          const obj = processResponse(JSON.parse(response), city);

          // store it in the map
          obj
            ? result.set(
                city.censusState,
                result.get(city.censusState).concat(obj)
              )
            : "";
        } else {
          console.warn(
            `No response data for: ${city.censusPlaceId}, ${city.censusState}`
          );
        }
      }

      await sleep(1000);
    } // end for
  } else {
    throw new Error(
      "An array of processed cities from the Census API are required!"
    );
  }
  return result;
};
