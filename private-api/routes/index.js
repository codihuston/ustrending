const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();

const client = require("../db").client;

/* GET home page. */
router.get("/", function (req, res, next) {
  debug("HIT!");
  return res.json({ title: "Called Private API!" });
});

module.exports = router;
