/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replciated).
 * 
 * 1. [x] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [x] query google -> gets all trends
 *    2a. [x] query google trends explorer -> gets info needed in prior to
 *        fetching geo info per trend
 *    2b. [x] query google trends geocompared -> gets trend ranking by
 *        state/region
 * 3. [x] process trend/state rankings for clients to use
 * 4. [x] store to redis
 */
const debug = require("debug")("worker:index");
const Redis = require("ioredis");
const CronJob = require('cron').CronJob;
const parser = require('cron-parser');

const trends = require("./lib/trends");
const explorer = require("./lib/explorer");
const widgetData = require("./lib/widget-data");
const processor = require("./lib/processor");
const defaults = require("./lib/defaults");
const utils = require("./lib/utils");

const REDIS_DAILY_TRENDS_KEY = process.env.REDIS_DAILY_TRENDS_KEY || defaults.REDIS_DAILY_TRENDS_KEY;
const REDIS_DAILY_TRENDS_BY_STATE_KEY = process.env.REDIS_DAILY_TRENDS_BY_STATE_KEY || defaults.REDIS_DAILY_TRENDS_BY_STATE_KEY;
const REDIS_REALTIME_TRENDS_BY_STATE_KEY = process.env.REDIS_REALTIME_TRENDS_BY_STATE_KEY || defaults.REDIS_REALTIME_TRENDS_BY_STATE_KEY;
const CRON_EXPRESSION_DAILY_TRENDS = process.env.CRON_EXPRESSION_DAILY_TRENDS || defaults.CRON_EXPRESSION_DAILY_TRENDS;
const CRON_EXPRESSION_REALTIME_TRENDS = process.env.CRON_EXPRESSION_REALTIME_TRENDS || defaults.CRON_EXPRESSION_REALTIME_TRENDS;
const CRON_TIMEZONE = process.env.CRON_TIMEZONE ||  defaults.CRON_TIMEZONE;

const client = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
});

async function runDailyTrends(cronjobName){
  try{  
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

    // Step 4/5: Get data and process it for client use
    const results = processor.process(dailyTrends, comparedGeo);
    debug("geographical data for trends", results);

    // Step 5/5: store in redis
    client.set(REDIS_DAILY_TRENDS_KEY, JSON.stringify(dailyTrends.default?.trendingSearchesDays?.[0]?.trendingSearches));
    client.set(REDIS_DAILY_TRENDS_BY_STATE_KEY, JSON.stringify([...results]));
  }
  catch(e){
    // TODO: notify admins?
    console.error(e);
  }
  console.log(`Cronjob '${cronjobName}' complete.`);
}

/**
 * TODO: implement me
 */
async function runRealtimeTrends(cronjobName){
  console.log(`Cronjob '${cronjobName}' complete.`);
}

client.on("connect", function(){
  console.log("Connected to redis!");
});

client.on("ready", async function(){
  const CRONJOB_DAILY_TRENDS = "DAILY TRENDS";
  const CRONJOB_NAME_REALTIME_TRENDS = "REALTIME TRENDS";

  console.log("Redis connection ready!");
  console.log("Crontab pattern: ", CRON_EXPRESSION_DAILY_TRENDS)

  // run daily trends in a cronjob
  const cronRunDailyTrends = new CronJob(CRON_EXPRESSION_DAILY_TRENDS, async function() {
    const interval = parser.parseExpression(CRON_EXPRESSION_DAILY_TRENDS);

    console.log(`Executing [${CRONJOB_DAILY_TRENDS}] cronjob. Next execution scheduled for `, interval.next().toISOString());

    await runDailyTrends(CRONJOB_DAILY_TRENDS);

  }, null, true, CRON_TIMEZONE);

  // run realtime trends in a cronjob
  const cronRunRealtimeTrends = new CronJob(CRON_EXPRESSION_REALTIME_TRENDS, async function() {
    const interval = parser.parseExpression(CRON_EXPRESSION_REALTIME_TRENDS);
    console.log(`Executing [${CRONJOB_NAME_REALTIME_TRENDS}] cronjob. Next execution scheduled for `, interval.next().toISOString());

    await runRealtimeTrends(CRONJOB_NAME_REALTIME_TRENDS);

  }, null, true, CRON_TIMEZONE);

  // start the jobs
  await cronRunDailyTrends.start();
  await cronRunRealtimeTrends.start();

  // run in case it doesn't at first-run...
  console.log("Initializing first-run (outside of cronjob)")
  await runDailyTrends(CRONJOB_DAILY_TRENDS);
  await runRealtimeTrends(CRONJOB_NAME_REALTIME_TRENDS);
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