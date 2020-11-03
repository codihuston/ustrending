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

/**
 * Fetch locations from twitter, pass to yahoo, and add geospatial data
 * to them before persisting to the db.
 */
router.post("/places/update", async function (req, res, next) {
  try {
    const twitterPlaces = await TwitterController.getPlaces();
    const places = await TwitterController.createPlaces(twitterPlaces);
    res.json(places);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
