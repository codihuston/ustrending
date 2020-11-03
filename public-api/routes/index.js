const express = require("express");
const axios = require("axios");
const debug = require("debug")("public-api:index");
const router = express.Router();

const { PRIVATE_API_URL } = require("../lib/utils");
const client = require("../db").client;

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.json({ title: "Express" });
});

/**
 * Fetches a set of daily trends from the private API
 *
 * Returns: [
 *  {...} // trend response from google,
 *  ...
 * ]
 */
router.get("/google/trends/daily", async function (req, res, next) {
  try {
    const result =
      (await axios.get(`${PRIVATE_API_URL}/google/trends/daily`)) || null;

    return res.json(result.data);
  } catch (e) {
    next(e);
  }
});

/**
 * Fetches a set of trends per state from the private API. The response
 * is shaped this way b/c I seralized a JS Map when caching this into redis.
 * This is expected to be used as a JS Map on the client-side.
 *
 * Returns: [
 *    [
 *      "STATE NAME",
 *      [
 *        {topic,valie,geoCode} // trend
 *        ...
 *      ]
 *    ],
 *    ...
 * ]
 */
router.get("/google/trends/daily/states", async function (req, res, next) {
  try {
    const result =
      (await axios.get(`${PRIVATE_API_URL}/google/trends/daily/states`)) ||
      null;

    return res.json(result.data);
  } catch (e) {
    next(e);
  }
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
