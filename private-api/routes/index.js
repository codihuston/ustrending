const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();

const { initCache } = require("../db");

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const cacheClient = await initCache();
    cacheClient.set("TEST", "TEST");
    return res.json({ title: "Called Private API!" });
  } catch (e) {
    next(e);
  }
});

/**
 * fetch from the redis cache
 */
router.get("/cache", function (req, res, next) {
  debug("HIT!");
  return res.json({ title: "Called Private API!" });
});

/**
 * insert into the redis cache
 */
router.post("/cache", function (req, res, next) {
  debug("HIT!");
  return res.json({ title: "Called Private API!" });
});

module.exports = router;
