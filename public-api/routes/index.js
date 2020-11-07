/**
 * This route is designed to fetch data from our datastore (redis or mongodb).
 */
const express = require("express");
const router = express.Router();
const debug = require("debug")("public-api:index-route");

const PlaceController = require("../controllers/place");
const ZipcodeController = require("../controllers/zipcode");
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
      const { long, lat } = req.query;
      const obj = await PlaceController.getClosest(long, lat);
      return res.json(obj);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * Given the zipcode of a place, fetch the closest Twitter Place (that
 * we've processed into our database)
 *
 * 1. get the nearest zip code (and its coordinates)
 * 2. get the nearest twitter place as per those coordinates
 *
 * This method will be used by clients who decide not to share their
 * browser location, and instead offer a zipcode
 *
 * example: /private-api/places/nearest/12345
 */
router.get(
  "/places/nearest/:zip",
  validator("params", validatorSchemas.zip),
  async function (req, res, next) {
    try {
      let place = null;
      const { zip } = req.params;
      const zipcode = await ZipcodeController.get(zip);

      // if we got a zipcode, we need to use its coordinates to fetch
      // a twitter place closest to this zipcode
      if (zipcode) {
        const [long, lat] = zipcode.geometry.coordinates;

        place = await PlaceController.getClosest(long, lat);

        if (!place) {
          return res.status(404).send();
        }
        return res.json(place);
      } else {
        return res.status(404).send();
      }
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
