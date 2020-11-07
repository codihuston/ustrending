const debug = require("debug")("public-api:location-ctrl");

const { Place } = require("../models/place");
const { initCache } = require("../db");
const { secondsAs } = require("../lib/utils");

module.exports = {
  /**
   * Get zipcode by a given zipcode
   */
  getClosest: async (long, lat) => {
    const cacheClient = await initCache();
    let place = null;
    const CACHE_KEY = `${long},${lat}`;

    if ((!long, !lat)) {
      return place;
    }

    // fetch from cache (if applicable)
    place = await cacheClient.get(CACHE_KEY);

    if (!place) {
      // find nearest town to the given long,lat
      place = await Place.findOne({
        geo: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [long, lat],
            },
          },
        },
        placeType: {
          code: 7,
          name: "Town",
        },
      }).lean();

      // cache it
      if (place) {
        await cacheClient.set(
          CACHE_KEY,
          JSON.stringify(place),
          "ex",
          secondsAs("HOUR", 3)
        );
      }
    } else {
      place = JSON.parse(place);
      debug("CACHE HIT!");
    }

    return place;
  },
};
