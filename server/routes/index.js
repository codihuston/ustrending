var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({ title: 'Express' });
});

/**
 * TODO: implement me
 */
router.get('/daily-trends', function(req, res, next) {
  return res.json({ title: 'return daily trends from redis' });
});

/**
 * TODO: implement me
 */
router.get('/realtime-trends', function(req, res, next) {
  return res.json({ title: 'return realtime trends from redis' });
});

module.exports = router;
