const debug = require("debug")("private-api:twitter-ctrl");

const { initCache } = require("../db");
const TwitterAPI = require("../api/twitter");
const YahooAPI = require("../api/yahoo");
const { Place } = require("../models/place");
const { secondsAs, sleep } = require("../lib/utils");

/**
 * Will fetch places from twitter at /trends/available. These are not
 * stored/used as-is (aside from caching); they are ultimately processed
 * in a manner in which I append some geospatial data (and more) to it
 * from the Yahoo API. This geospatial data is crucial in some of the features
 * that this app will offer. (i.e. finding trends near a given location)
 */
module.exports.getPlaces = async function () {
  try {
    const CACHE_KEY = "twitter:places";
    const client = initCache();

    const cache = await client.get(CACHE_KEY);

    if (cache) {
      debug("CACHE HIT");
      return JSON.parse(cache);
    } else {
      // this is returned as a string
      const places = await TwitterAPI.getPlaces();
      if (places) {
        client.set(CACHE_KEY, places, "ex", secondsAs("DAY"));

        return JSON.parse(places);
      }
      return [];
    }
  } catch (e) {
    throw e;
  }
};

/**
 * Given a list of "twitter places", query yahoo for useful information,
 * attach it to the twitter place object, and store it. The geospatial
 * data is needed for some features of this service.
 *
 * (i.e. finding trends near a given location)
 *
 * @param {*} places
 */
module.exports.createPlaces = async function (places) {
  const results = [];

  await places.reduce(async (p, place) => {
    try {
      // make sure previous promise is done; this check also handles
      // the throwing of errors up the promise chain
      await p;

      return await (async () => {
        console.log(`LOOP! ${new Date()}`, place.name);

        const uri = YahooAPI.getUriByWoeid(place.woeid);
        const {
          name,
          placeType,
          url,
          parentid,
          country,
          woeid,
          countryCode,
        } = place;

        debug("Query Yahoo for Place: ", uri);

        const response = await YahooAPI.getForecast(uri);
        const { location } = response;

        // verify that there is location data
        if (response && location && Object.keys(location).length) {
          const { region, timezone_id, lat, long } = location;

          // build mongo queries
          const query = {
            woeid,
          };
          const update = {
            name,
            placeType,
            url,
            parentid,
            country,
            woeid,
            countryCode,
            // custom fields
            region: region ? region.trim() : "",
            timezone_id,
            geo: {
              type: "Point",
              coordinates: [long, lat],
            },
            woeid,
            yahooUri: uri,
          };
          const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          };

          console.log(query, update, options);

          // upsert place in mongodb, return as plain JSON
          const newInstance = await Place.findOneAndUpdate(
            query,
            update,
            options
          ).lean();

          results.push(newInstance);
        } // end if
        else {
          console.log(
            "No response from YahooAPI for",
            place.name,
            place.country
          );
        }

        return await sleep(1000);
      })();
    } catch (e) {
      throw e;
    }
  }, Promise.resolve());

  return results;
};
