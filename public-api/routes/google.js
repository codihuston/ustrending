const express = require("express");
const axios = require("axios");
const router = express.Router();

const { PRIVATE_API_URL } = require("../lib/utils");
/**
 * Fetches a set of daily trends from the private API
 *
 * Returns: [
 *  {...} // trend response from google,
 *  ...
 * ]
 */
router.get("/trends/daily", async function (req, res, next) {
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
router.get("/trends/daily/states", async function (req, res, next) {
  try {
    const result =
      (await axios.get(`${PRIVATE_API_URL}/google/trends/daily/states`)) ||
      null;

    return res.json(result.data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
