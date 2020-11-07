const express = require("express");
const router = express.Router();
const debug = require("debug")("public-api:index-route");

const { Place } = require("../models/place");
const { initCache } = require("../db");
const { secondsAs } = require("../lib/utils");
const validator = require("../middleware/validator");
const validatorSchemas = require("../validators/index");

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.json({ title: "Express" });
});

/**
 * Given the long/lat of a place, fetch the closest Twitter Place (that
 * we've processed into our database)
 *
 * example: /private-api/places/nearest?long=36.9685&lat=86.4808
 */
router.get(
  "/places/nearest/point",
  validator("query", validatorSchemas.point),
  async function (req, res, next) {
    try {
      const cacheClient = await initCache();
      let place = null;

      const { long, lat } = req.query;

      const CACHE_KEY = `${long},${lat}`;

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

      return res.json(place);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
