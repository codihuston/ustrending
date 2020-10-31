const OAuth = require("oauth");
const { Location } = require("../models/location");

/**
 * Generates a URI to use when querying the YAHOO WEATHER API.
 *
 * @param {*} city  : census place
 * @param {*} state : census state
 */
function getUri(city, state) {
  const API_ENDPOINT = `https://weather-ydn-yql.media.yahoo.com/forecastrss?location=<CITY>,<STATE>&format=json`;

  const uri = API_ENDPOINT.replace("<CITY>", city).replace("<STATE>", state);

  console.log("Sending response to: ", uri);

  if (!city) {
    return [];
  }
  return uri;
}

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
async function getForecast(uri) {
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
    return await new Promise((resolve, reject) => {
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
            if (data !== "" || typeof data === undefined) {
              const json = JSON.parse(data);

              // if no location data is given, then just return nothing
              if (Object.keys(json.location).length === 0) {
                console.warn(
                  "SKIPPING: No location data returned from yahoo:",
                  uri
                );
                // return nothing so that we don't save a bad location to the db
                resolve(null);
              }

              console.log("YAHOO DATA", data);

              // return response data and uri
              resolve(data);
            } else {
              console.warn("Bad response data from:", uri);
              resolve(null);
            }
          }
        }
      );
    });
  } catch (e) {
    // continue processing the rest of the cities on error
    console.error(e);
    return null;
  }
}

/**
 * Uses the response data from the US Census and the Yahoo Weather API to
 * build a location record containing the information we will need for the
 * Twitter bot.
 *
 * @param {*} yahooResponse
 * @param {*} censusCity
 */
async function processResponse(yahooResponse, censusCity) {
  if (!yahooResponse || !Object.keys(yahooResponse.location).length === 0) {
    return null;
  }

  try {
    // parse response data
    const {
      censusPlaceId,
      censusStateId,
      population,
      censusState,
    } = censusCity;
    const {
      location: { city, region, country, timezone_id, long, lat, woeid },
      uri,
    } = yahooResponse;

    // build mongo queries
    const query = {
      censusPlaceId: censusPlaceId,
    };
    const update = {
      population,
      censusPlaceId,
      censusStateId,
      city,
      region: region ? region.trim() : null,
      regionFullName: censusState,
      country,
      timezone_id,
      coordinates: {
        type: "Point",
        coordinates: [long, lat],
      },
      woeid,
      yahooUri: uri,
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    console.log(query, update, options);

    // upsert location in mongodb, return as plain JSON
    return await Location.findOneAndUpdate(query, update, options).lean();
  } catch (e) {
    console.warn(
      `Failed to process response for census city:`,
      JSON.stringify(censusCity, null, 4),
      ` and yahoo city: `,
      JSON.stringify(yahooResponse, null, 4)
    );
    console.error(e);
  }
  return null;
}

/**
 * Returns a promise designed to space out outgoing requests to the Yahoo API.
 *
 * @param {*} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This VOID method will:
 *
 * - iterate over all given pre-processed Census (cities from
 * the previous step)
 *    - query the Yahoo API with their city/state.
 *    - process the city data from the Census and Yahoo API into 1 singular
 *    location record
 *    - store the record in MongoDB
 *
 * WARNING: THIS ASSUMES THAT THE YAHOO API WILL UNDERSTAND THE GIVEN CITY. As
 * it stands, it appears to be able to understand 98% of the given city formats.
 * This is a bit of a saving grace, IMO.
 *
 * @param {*} client : redis client
 * @param {*} cities : processed census cities
 * @param {*} CACHE_KEY_PREFIX  : a prefix for where Yahoo API responses are
 *  cached
 */
module.exports.getUSCityInformation = async function (
  client,
  cities,
  CACHE_KEY_PREFIX
) {
  const result = new Map();

  // if given cities
  if (cities.length) {
    // get yahoo info for each city
    for (const censusCity of cities) {
      let wasCacheHit = false;
      const cacheKey = `${CACHE_KEY_PREFIX}-${censusCity.censusPlaceId}`;
      let response = await client.get(cacheKey);
      const uri = getUri(censusCity.censusPlace, censusCity.censusState);

      // if this response is in the cache, reuse it!
      if (response) {
        wasCacheHit = true;

        console.log(
          `CACHE HIT (${cacheKey}): reusing cache for ${censusCity.censusPlaceId}, ${censusCity.censusState}`
        );

        // if the cache doesn't have a uri property, set it
        const yahooResponse = JSON.parse(response);
        if (!yahooResponse.uri) {
          yahooResponse.uri = uri;
          // update it in cache
          client.set(cacheKey, JSON.stringify(yahooResponse));

          console.log(`CACHE UPDATE ${cacheKey} with new uri`, uri);
        }

        // process it
        const obj = await processResponse(yahooResponse, censusCity);
      } else {
        // otherwise, query the api
        let response = await getForecast(uri);

        if (response && response.length) {
          // add uri to this object (so it's available in the cache)
          const yahooResponse = JSON.parse(response);
          yahooResponse.uri = uri;

          // cache weather response (NOTE: response is returned as string)
          // key: cacheKey-${censusPlaceID}
          await client.set(
            cacheKey,
            JSON.stringify(yahooResponse),
            "ex",
            process.env.REDIS_TTL
          );

          // process the response
          const obj = await processResponse(yahooResponse, censusCity);
        } else {
          console.warn(
            `No response data for: ${censusCity.censusPlaceId} - ${censusCity.censusPlace}, ${censusCity.censusState}`
          );
        }
      }

      // sleep only if there is not a cache hit (and we need to query the api)
      wasCacheHit ? null : await sleep(1000);
    } // end for
  } else {
    throw new Error(
      "An array of processed cities from the Census API are required!"
    );
  }
};
