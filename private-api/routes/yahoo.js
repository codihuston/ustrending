const express = require("express");
const debug = require("debug")("private-api:yahoo-route");
const router = express.Router();
const controller = require("../controllers/yahoo");

/**
 * GET weather forecast (includes long/lat of a location) given a WOEID
 * from the Yahoo API
 */
router.get("/weather/:woeid", async function (req, res, next) {
  try {
    return res.json(await controller.getWeather(req.params.woeid));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
