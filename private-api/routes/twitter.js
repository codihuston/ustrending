// C:\Users\Codi\git\ustrending\worker-twitter-trends\debug\trends-available-response.json
const express = require("express");
const debug = require("debug")("private-api:twitter-route");
const router = express.Router();
const TwitterController = require("../controllers/twitter");

/**
 * Fetch available twitter places, from the Twitter API
 */
router.get("/places", async function (req, res, next) {
  try {
    res.json(await TwitterController.getPlaces());
  } catch (e) {
    next(e);
  }
});

/**
 * Fetch locations from twitter, pass to yahoo, and add geospatial data
 * to them before persisting to the db. This is designed to only be used
 * when initializing this data.
 *
 * TODO: this will timeout with 504, but the process will run in the
 * background first... fix this to run in a background process
 */
router.post("/places", async function (req, res, next) {
  try {
    const twitterPlaces = await TwitterController.getPlaces();
    const places = await TwitterController.createPlaces(twitterPlaces);
    res.json(places);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
