const express = require("express");
const axios = require("axios");
const debug = require("debug")("public-api:index");
const router = express.Router();

const client = require("../db").client;

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.json({ title: "Express" });
});

/**
 * TODO: implement me
 */
router.get("/daily-trends", async function (req, res, next) {
  const dailyTrendsByState =
    (await client.get(process.env.REDIS_DAILY_TRENDS_KEY)) || null;

  console.log(dailyTrendsByState);

  return res.json(JSON.parse(dailyTrendsByState));
});

/**
 * TODO: implement me
 */
router.get("/daily-trends-by-state", async function (req, res, next) {
  const dailyTrendsByState =
    (await client.get(process.env.REDIS_DAILY_TRENDS_BY_STATE_KEY)) || null;

  console.log(dailyTrendsByState);

  return res.json(JSON.parse(dailyTrendsByState));
});

/**
 * TODO: implement me
 */
router.get("/realtime-trends", function (req, res, next) {
  return res.json({ title: "return realtime trends from redis" });
});

/**
 * TODO: implement me
 */
router.get("/test", async function (req, res, next) {
  const uri =
    "http://" +
    process.env.PRIVATE_API_HOST +
    ":" +
    process.env.PRIVATE_API_PORT;
  debug("PRIVATE API URI", uri);
  try {
    const response = await axios.get(uri);
    res.send(response.data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
