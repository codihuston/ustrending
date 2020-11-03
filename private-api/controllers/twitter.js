const debug = require("debug")("private-api:twitter-ctrl");

const TwitterAPI = require("../api/twitter");
const { initCache } = require("../db");
const { secondsAs } = require("../lib/utils");

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
