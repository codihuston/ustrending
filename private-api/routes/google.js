const express = require("express");
const debug = require("debug")("private-api:google");
const router = express.Router();

const { initCache } = require("../db");
const CACHE_DAILY_TRENDS_KEY = "daily-trends";
const CACHE_DAILY_TRENDS_BY_STATE_KEY = "daily-trends-by-state";

/**
 * Used to get Daily Google Trends that have previously been stored.
 *
 * Expects: none
 *
 * Returns [{}] || null
 */
router.get("/trends/daily", async function (req, res, next) {
  try {
    const cache = initCache();
    const result = await cache.get(CACHE_DAILY_TRENDS_KEY);

    return res.json(JSON.parse(result));
  } catch (e) {
    next(e);
  }
});

/**
 * Used to get Daily Google Trends results that have been previously stored,
 *
 * Expects: none
 *
 * Returns: [{}] || null
 */
router.get("/trends/daily/states", async function (req, res, next) {
  try {
    const cache = initCache();
    const result = await cache.get(CACHE_DAILY_TRENDS_BY_STATE_KEY);

    return res.json(JSON.parse(result));
  } catch (e) {
    next(e);
  }
});

/**
 * Used to store Daily Google Trends results.
 *
 * Expects: {value: "some value"}
 *
 * Returns [{}] || null
 */
router.post("/trends/daily", async function (req, res, next) {
  try {
    const cache = initCache();
    await cache.set(CACHE_DAILY_TRENDS_KEY, req.body.value);

    return res.send();
  } catch (e) {
    next(e);
  }
});

/**
 * Used to store Daily Google Trends results that have been processed
 * by a worker.
 *
 * Expects: {value: "some value"}
 *
 * Returns: [{}] || null
 */
router.post("/trends/daily/states", async function (req, res, next) {
  try {
    const cache = initCache();
    await cache.set(CACHE_DAILY_TRENDS_BY_STATE_KEY, req.body.value);

    return res.send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
