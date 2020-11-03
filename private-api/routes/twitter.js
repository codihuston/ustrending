// C:\Users\Codi\git\ustrending\worker-twitter-trends\debug\trends-available-response.json
const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();

const twitterPlaces = require("../temp/trends-available-response.json");
const { Place } = require("../models/place");
const { initCache } = require("../db");
const TwitterController = require("../controllers/twitter");
const YahooAPI = require("../api/yahoo");
const { sleep } = require("../lib/utils");

function methodThatReturnsAPromise(nextID) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Resolve! ${new Date()}`);

      resolve(nextID);
    }, 1000);
  });
}

/**
 *
 */
router.get("/places", async function (req, res, next) {
  try {
    res.json(await TwitterController.getPlaces());
  } catch (e) {
    next(e);
  }
});

router.get("/places/update", async function (req, res, next) {
  try {
    /**
     * TODO:
     * - for each twitter place
     *    - find matching woeid in mongodb (to get its long/lat)
     *    - set the log/lat on this object
     *    - store in new collection (twitterPlaces || places)
     *
     * - for locations whose data I do not have... I need to get it. I
     * will then configure the worker-cities service to fetch all
     * "twitterPlaces" from mongo, feed them to the Yahoo API, and update
     * those objects only (do NOT store them in the locations collection, where
     * I keep the US locations data, which is NOT going to be used in
     * production)
     */
    const twitterPlaces = await TwitterController.getPlaces();
    const places = await TwitterController.createPlaces(twitterPlaces);
    res.json(places);
  } catch (e) {
    next(e);
  }
});
router.get("/:woeid", async function (req, res, next) {
  try {
    /**
     * TODO:
     * - for each twitter place
     *    - find matching woeid in mongodb (to get its long/lat)
     *    - set the log/lat on this object
     *    - store in new collection (twitterPlaces || places)
     *
     * - for locations whose data I do not have... I need to get it. I
     * will then configure the worker-cities service to fetch all
     * "twitterPlaces" from mongo, feed them to the Yahoo API, and update
     * those objects only (do NOT store them in the locations collection, where
     * I keep the US locations data, which is NOT going to be used in
     * production)
     */
    const uri = YahooAPI.getUriByWoeid(req.params.woeid);
    const result = await YahooAPI.getForecast(uri);

    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
