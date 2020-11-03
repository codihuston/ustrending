const express = require("express");
const debug = require("debug")("private-api:yahoo-route");
const router = express.Router();
const controller = require("../controllers/yahoo");

router.get("/weather/:woeid", async function (req, res, next) {
  try {
    return res.json(await controller.getWeather(req.params.woeid));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
