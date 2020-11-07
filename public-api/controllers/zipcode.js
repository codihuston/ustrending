const debug = require("debug")("public-api:zipcode-ctrl");

const { initCache } = require("../db");
const { Zipcode } = require("../models/zipcode");
const { secondsAs } = require("../lib/utils");

module.exports = {
  /**
   * Get zipcode by a given zipcode
   */
  get: async (zip) => {
    let zipcode = null;
    const CACHE_KEY = `zipcode:${zip}`;
    const cacheClient = await initCache();

    // fetch from cache
    zipcode = await cacheClient.get(CACHE_KEY);

    if (zipcode) {
      debug("CACHE HIT!");
      return JSON.parse(zipcode);
    }
    // fetch from db
    else {
      zipcode = await Zipcode.findOne({
        "fields.zip": zip,
      });

      // cache it
      if (zipcode) {
        cacheClient.set(
          CACHE_KEY,
          JSON.stringify(zipcode),
          "ex",
          secondsAs("HOUR", 1)
        );
      }
      return zipcode;
    }
  },
};
