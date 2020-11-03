/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn"t need to be replicated).
 *
 * 1. [] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *
 *    2a. [] use deterministic algorithm to select a subset of US cities
 *        by population, and fetch the top trends for each one
 *
 *        IMPORTANT: twitter rate-limits 75 requests per 15 minutes
 *
 *    2b. [] for each state, sort the trends for each city the most popular
 *        ones "bubble up". These "tweet_volumes" may need to be normalized
 *        so that trends in smaller cities might have a chance to top the charts
 *        over larger cities.
 *
 *        - perhaps at this point, we need to cache the top trends for each
 *        city prior to running this sorting algorithm? This would allow us to
 *        "snap" users to "nearby locations" to show them what is trending
 *        locally? Not sure how this would be "fetched" after the fact, though.
 *
 *        - perhaps we cache this in a "LONG,LAT" key in redis, and also append
 *        this pair of keys to a collection of LONG, LAT called
 *        "cached_local_trends". When the client requests "local trends near
 *        me" from the api server, they pass along their GPS coordinates.
 *        Then we simply fetch the "cached_local_trends", determine which of
 *        those GPS coordinates the client is closes to, then return that set
 *        (display in table?)
 *
 *        - see: https://redis.io/commands/georadius
 *
 *    2c. Finally, sort this into the following format:
 *
 *          {...STATES => [...STATE_TRENDS]}
 *
 *        This result will be declared the "top X trends" for each corresponding
 *        state (and will be plugged directly into the twitter map)
 *
 *    2d. [] store map-ready results into redis
 */ /**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replicated).
 *
 * 1. [x] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [x] query census (cities by population) -> population data MAY be used
 *        to determine how to aggregate state-wide trending data on twitter
 *    2a. [] query yahoo (for WOEID, LONG/LAT)
 * 3. [-] (partially complete) process city/state data into the following
 *    example:
 *
 *      [{
 *        state_full_name: {
 *          abbeviation
 *          city_name
 *          city_population
 *          woeid
 *          long
 *          lat
 *        }
 *      }]
 *
 * 4. [-] (partially complete, each response from yahoo API is cached. but the
 *    completed MAP data is not stored anywhere yet)
 *    should store completed data responses to redis / persist elsewhere?
 */
require("dotenv").config();
const Redis = require("ioredis");

const twitter = require("./lib/twitter");

const client = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
});

client.on("connect", function () {
  console.log("Redis: connected!");
});

client.on("ready", async function () {
  console.log("Redis: ready!");
  const CACHE_COMPLETED_CITIES = "worker-cities:completed-cities";

  // TODO: wrap this stuff in a cronjob so that it will be re-attempted later if it fails
  try {
    // cached state/city map string
    let locations = await client.get(CACHE_COMPLETED_CITIES);
    // the map (converted from the above string)
    let locationMap = new Map();
    // the map of state/cities that twitter will fetch trends for for this iteration
    let twitterMap = new Map();

    // if we got a result, convert it to a map
    if (locations) {
      // convert to object
      locations = JSON.parse(locations);

      // convert to map
      locations.map((x) => {
        locationMap.set(x[0], x[1]);
      });
    }

    // TODO: if is Q1 of the hour, get the max population
    if (true) {
      // get the cities with the highest population from each city
      for (let [state, cities] of locationMap.entries()) {
        // init this state in the map
        if (!twitterMap.get(state)) {
          twitterMap.set(state, []);
        }
        // get the max population
        twitterMap.set(state, cities[cities.length - 1]);
      }
    }

    // only has 51 states?
    console.log(twitterMap);
    await twitter.getTrendsByPlace(locationMap.get("Maryland"));

    console.log("DONE.");
  } catch (e) {
    // fatal error occured
    console.error(e);
    process.exit(e.errno);
  }
});

client.on("close", function (e) {
  console.log("Closed connection to redis!", e);
});

client.on("reconnecting", function (e) {
  console.log("Reconnecting to redis!", e);
});

client.on("error", function (error) {
  console.error(error);
  process.exit(error.errno);
});
