const express = require('express');
const router = express.Router();

const client = require('../db').client;


/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({ title: 'Express' });
});

/**
 * TODO: implement me
 */
router.get('/daily-trends', async function(req, res, next) {
  const dailyTrends = await client.get(process.env.REDIS_DAILY_TRENDS_KEY) || null;
  
  console.log(dailyTrends);

  return res.json(JSON.parse(dailyTrends));
});

/**
 * TODO: implement me
 */
router.get('/daily-trends-by-state', async function(req, res, next) {
  const dailyTrends = await client.get(process.env.REDIS_DAILY_TRENDS_BY_STATE_KEY) || null;
  
  console.log(dailyTrends);

  return res.json(JSON.parse(dailyTrends));
});

/**
 * TODO: implement me
 */
router.get('/realtime-trends', function(req, res, next) {
  return res.json({ title: 'return realtime trends from redis' });
});

module.exports = router;
