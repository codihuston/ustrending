const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();

const { Location } = require("../models/location");
const { initCache } = require("../db");

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const cacheClient = await initCache();
    await cacheClient.set("TEST", "TEST");
    const locations = await Location.find();

    return res.json({ title: "Called Private API!", locations });
  } catch (e) {
    next(e);
  }
});

/**
 * fetch from the redis cache
 */
router.get("/cache/:key", async function (req, res, next) {
  try {
    const cacheClient = await initCache();
    return res.send(await cacheClient.get(req.params.key));
  } catch (e) {
    next(e);
  }
});

/**
 * insert into the redis cache
 */
router.post("/cache", async function (req, res, next) {
  try {
    const cacheClient = await initCache();
    return res.send(await cacheClient.set(req.body.key, req.body.value));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
