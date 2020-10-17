/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replciated).
 * 
 * TODO: 
 * 1. [x] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [x] query google -> gets all trends
 *    2a. [x] query google trends explorer -> gets info needed in prior to
 *        fetching geo info per trend
 *    2b. [x] query google trends geocompared -> gets trend ranking by
 *        state/region
 * 3. [] process trend/state rankings for clients to use
 * 4. [] store to redis
 */
const debug = require("debug")("worker:index");
const Redis = require("ioredis");
const trends = require("./lib/trends");
const explorer = require("./lib/explorer");
const widgetData = require("./lib/widget-data");
const utils = require("./lib/utils");

const client = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
});

client.on("connect", function(){
  console.log("Connected to redis!");
});

client.on("ready", async function(){
  console.log("Redis connection ready!");
  try{
    // TODO: implement cron here

    // Step 1/5: Get all daily trends
    const dailyTrends = await trends.getDailyTrends();
    debug("daily trends", dailyTrends);

    if(!dailyTrends){
      throw new Error("Unable to fetch daily trends from Google Trends API!");
    }

    // Step 2/5: Get explorer trends
    const exploredTrends = await explorer.exploreTrends(dailyTrends);
    debug("explored trends", exploredTrends);

    // Step 3/5: Get the "ComparedGeo" data from widget data API
    const comparedGeo = await widgetData.comparedGeo(exploredTrends);
    debug("compared geo", comparedGeo);

    // TODO: Step 4/5: Get data and process it for client use
    // process(dailyTrends, exploredTrends);

    // Step 5/5: store in redis

  }
  catch(e){
    // TODO: notify admins?
    console.error(e);
  }
});

client.on("close", function(){
  console.log("Closed connection to redis!");
});

client.on("reconnecting", function(){
  console.log("Reconnecting to redis!");
});

client.on("error", function(error){
  console.error(error);
  process.exit(error.errno);
});