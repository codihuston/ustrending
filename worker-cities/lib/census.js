/**
 * Refs:
 * - https://www.census.gov/data/developers/data-sets.html
 * - https://api.census.gov/data/2019/acs/acsse/examples.html
 * - us state / city pop 65000+: https://api.census.gov/data/2019/acs/acs1?get=NAME,B01001_001E&for=place:*&in=state:*&key=<API_KEY>
 * - us state / city pop 25000+: https://api.census.gov/data/2019/acs/acsse?get=NAME,K200101_001E&for=place:*&in=state:*&key=<API_KEY>
 */
const fetch = require("node-fetch");

const CENSUS_YEAR = "2019";
// 25k+
const CENSUS_ACS_URI_TEMPLATE =
  "https://api.census.gov/data/<YEAR>/acs/acsse?get=NAME,K200101_001E&for=place:*&in=state:*&key=<API_KEY>";
const ALIASES = {
  K200101_001E: "population",
  state: "censusStateId",
  place: "censusPlaceId",
};
// the key that the city/state lives under in the response data
const CENSUS_PLACE_KEY = "NAME";
const PROCESSED_CENSUS_PLACE_KEY = "censusPlace";
const PROCESSED_CENSUS_STATE_KEY = "censusState";
// replace url templated params
const CENSUS_ACS_URI = CENSUS_ACS_URI_TEMPLATE.replace(
  "<API_KEY>",
  process.env.CENSUS_API_KEY
).replace("<YEAR>", CENSUS_YEAR);

async function getUSCityPopulation() {
  try {
    console.log("SENDING REQUEST", CENSUS_ACS_URI);

    const results = await fetch(CENSUS_ACS_URI);

    if (results) {
      const body = await results.json();

      console.log("RESULTS", body.status, body);

      const jsonResults = [];
      // convert results into a array of json objects
      const headers = body[0];

      // for each city
      for (let i = 1; i < body.length; i++) {
        const row = body[i];
        const obj = {};

        // process each property into the object
        for (let j = 0; j < headers.length; j++) {
          let key = headers[j];

          // if this key contains the city/state
          if (key === CENSUS_PLACE_KEY) {
            // separate them into separate properties
            const temp = row[j].split(",");
            obj[PROCESSED_CENSUS_PLACE_KEY] = temp[0].trim();
            obj[PROCESSED_CENSUS_STATE_KEY] = temp[1].trim();
          } else {
            key = ALIASES[key] ? ALIASES[key] : key;
            obj[key] = row[j];
          }
        }

        jsonResults.push(obj);
        break;
      }

      console.log("jsonResults", jsonResults);
    } else {
      console.warn("No results from census.");
    }
  } catch (e) {
    console.error(e);
  }
}

getUSCityPopulation();
// module.exports.getUSCityPopulation = getUSCityPopulation;
// const p = new Promise(async (resolve, reject) => {
//   try {
//     resolve(await getUSCityPopulation());
//   } catch (e) {
//     reject(e);
//   }
// });
