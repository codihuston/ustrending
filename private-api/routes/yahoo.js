// C:\Users\Codi\git\ustrending\worker-twitter-trends\debug\trends-available-response.json
const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();
const { initCache } = require("../db");
const YahooAPI = require("../lib/yahoo");

router.get("/weather/:woeid", async function (req, res, next) {
  const CACHE_KEY = `yahoo:weather:`;
  try {
    if (!req.params.woeid) {
      next(new Error("Expected parameter 'woeid'."));
    } else {
    }

    const uri = YahooAPI.getUriByWoeid(req.params.woeid);
    const result = await YahooAPI.getForecast(uri);

    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
