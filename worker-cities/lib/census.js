/**
 * Refs:
 * - https://www.census.gov/data/developers/data-sets.html
 * - https://api.census.gov/data/2019/acs/acsse/examples.html
 * - us state / city pop 65000+: https://api.census.gov/data/2019/acs/acs1?get=NAME,B01001_001E&for=place:*&in=state:*&key=<API_KEY>
 * - us state / city pop 25000+: https://api.census.gov/data/2019/acs/acsse?get=NAME,K200101_001E&for=place:*&in=state:*&key=<API_KEY>
 */
const fetch = require("node-fetch");

const CENSUS_YEAR = "2019";
// 25k+ endpoint
const CENSUS_ACS_URI_TEMPLATE =
  "https://api.census.gov/data/<YEAR>/acs/acsse?get=NAME,K200101_001E&for=place:*&in=state:*&key=<API_KEY>";
// aliases used when processing census response
const ALIASES = {
  K200101_001E: "population",
  state: "censusStateId",
  place: "censusPlaceId",
};
// the key that the city/state lives under in the response data
const CENSUS_PLACE_KEY = "NAME";
// keys used when splitting the PLACE NAME (city) in the census response
const PROCESSED_CENSUS_PLACE_KEY = "censusPlace";
const PROCESSED_CENSUS_STATE_KEY = "censusState";
// keys used for cache
const CACHE_CENSUS_CITIES_RAW = "census-cities-response";

/**
 * Takes the JSON response from the Census API and processes it into
 * an array of cleaner JSON objects (rather than the arrays that it comes in)
 *
 * @param {*} response
 */
function processResponse(response) {
  const jsonResults = [];

  // convert results into a array of json objects
  const headers = response[0];

  // for each city
  for (let i = 1; i < response.length; i++) {
    const row = response[i];
    const obj = {};

    // process each property into the object
    for (let j = 0; j < headers.length; j++) {
      let key = headers[j];

      // if this key contains the city/state
      if (key === CENSUS_PLACE_KEY) {
        // separate them into separate properties
        const temp = row[j].split(",");
        // remove extra 'city' which is tacked onto their data for some reason
        // as well as extra whitespace
        // i.e.) "Oklahoma City city" => "Oklahoma City"
        obj[PROCESSED_CENSUS_PLACE_KEY] = temp[0].replace(/city/, "").trim();
        obj[PROCESSED_CENSUS_STATE_KEY] = temp[1].trim();
      } else {
        key = ALIASES[key] ? ALIASES[key] : key;
        obj[key] = row[j];
      }
    } // end for each property

    jsonResults.push(obj);
  } // end for each city

  return jsonResults;
}

module.exports.getUSCityPopulation = async function (
  client,
  CACHE_CENSUS_CITIES_PROCESSED
) {
  try {
    const jsonResults = [];
    // replace url templated params
    const CENSUS_ACS_URI = CENSUS_ACS_URI_TEMPLATE.replace(
      "<API_KEY>",
      process.env.CENSUS_API_KEY
    ).replace("<YEAR>", CENSUS_YEAR);

    const processedCensusResponse = JSON.parse(
      await client.get(CACHE_CENSUS_CITIES_PROCESSED)
    );

    // if we already have processed results, use it
    if (processedCensusResponse) {
      console.log(
        `CACHE HIT (${CACHE_CENSUS_CITIES_PROCESSED}): Previously processed census data found, returning it!`
      );
      return processedCensusResponse;
    }
    // if we do not, see if we at least have the raw census response data
    else {
      console.log(
        `CACHE MISS (${CACHE_CENSUS_CITIES_PROCESSED}): No census data processed and cached yet, continuing...`
      );

      const rawCensusResponse = JSON.parse(
        await client.get(CACHE_CENSUS_CITIES_RAW)
      );

      // if we do, process it!
      if (rawCensusResponse) {
        console.log(
          `CACHE HIT (${CACHE_CENSUS_CITIES_RAW}): We already got the results! Now process it!`
        );

        // process it
        const processed = processResponse(rawCensusResponse);

        return processed;
      }
      // otherwise, fetch it, then process it!
      else {
        console.log(
          `CACHE MISS (${CACHE_CENSUS_CITIES_RAW}): No raw census response data is cached, fetching from: `,
          CENSUS_ACS_URI
        );

        // fetch and parse into JSON
        const results = await (await fetch(CENSUS_ACS_URI)).json();

        if (results) {
          // cache raw results
          await client.set(
            CACHE_CENSUS_CITIES_RAW,
            JSON.stringify(results),
            "ex",
            process.env.REDIS_TTL
          );

          // process it
          const processed = processResponse(results);

          return processResponse(results);
        } else {
          console.warn("No results from census.");
        }
      }
    }
    return null;
  } catch (e) {
    console.error(e);
  }
};
