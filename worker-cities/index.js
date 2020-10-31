/**
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
const fs = require("fs");
const { resolve } = require("path");
const Redis = require("ioredis");
const mongoose = require("mongoose");

const { Location } = require("./models/location");
const census = require("./lib/census");
const yahoo = require("./lib/yahoo");
const database = require("./db");

const DUMP_FILE_NAME = `locations-${Date.now()}.json`;
const DUMP_FILE_PATH = resolve("../mongodb/dump", DUMP_FILE_NAME);

const client = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
});

/**
 * Will dump locations from mongodb into a file on your system. It will
 * NOT overwrite the pre-existing file.
 * @param {*} locations
 */
async function dumpLocations(locations) {
  return new Promise(async function (resolve, reject) {
    await fs.stat(DUMP_FILE_PATH, async function (error, stats) {
      // if file does not exist
      if (error) {
        console.log(`Dumping locations to: ${DUMP_FILE_PATH}`);

        // create it
        fs.writeFile(
          DUMP_FILE_PATH,
          JSON.stringify(locations, null, 4),
          function (err) {
            if (err) {
              reject(err);
            }

            console.log(
              `Finished dumping locations, you should replace the primary dump file with this one.`
            );
            resolve(true);
          }
        );
      }
      // it exists
      else {
        // don't write to it
        reject(
          new Error(
            `ERROR: ${DUMP_FILE_PATH} already exists, will not overwrite. Either remove it, or rename it.`
          )
        );
      }
    }); // end fs.stat
  }); // end promise
}

client.on("connect", function () {
  console.log("Redis: connected!");
});

client.on("ready", async function () {
  console.log("Redis: ready!");

  const db = await database.connect();

  // TODO: wrap this stuff in a cronjob so that it will be re-attempted later if it fails
  try {
    // keys used for cache
    const CACHE_CENSUS_CITIES_PROCESSED =
      "worker-cities:census-cities-processed";
    // key will be: ${CACHE_YAHOO_RESPONSE_PREFIX}-${cenusPlaceId}
    const CACHE_YAHOO_RESPONSE_PREFIX = "worker-cities:yahoo";
    const CACHE_COMPLETED_CITIES = "worker-cities:completed-cities";

    /**
     * get the us cities population data (and cache it)
     * this cache will prevent re-runs of this script from hitting the census
     * severs too unnecessarily
     */
    const censusCities = await census.getUSCityPopulation(client);
    console.log(
      "censusCities output",
      censusCities,
      CACHE_CENSUS_CITIES_PROCESSED
    );

    // cache processed results
    await client.set(
      CACHE_CENSUS_CITIES_PROCESSED,
      JSON.stringify(censusCities),
      "ex",
      process.env.REDIS_TTL
    );

    /**
     * get the us cities yahoo weather data (woeid, long/lat)
     */
    const yahooCities = await yahoo.getUSCityInformation(
      client,
      censusCities,
      CACHE_YAHOO_RESPONSE_PREFIX
    );
    console.log("yahooCities output", CACHE_YAHOO_RESPONSE_PREFIX);

    // cache the map only after completion
    client.set(
      CACHE_COMPLETED_CITIES,
      JSON.stringify([...yahooCities]),
      "ex",
      process.env.REDIS_TTL
    );

    /**
     * Dump the mongodb collection locally
     *
     * FOR DEVELOPMENT: deployment will import this into the mongodb container
     * FOR PRODUCTION:
     *  - option 1: if using cloud db, manually import this there
     *  - option 2: if not, manually copy this into the `server` service,
     *    and configure it to serve + cache this file (so services like twitter
     *    bot can access it)
     */
    const locations = await Location.find().sort({ population: 1 }).lean();

    if (locations) {
      await dumpLocations(locations); // end anon function
    } else {
      console.warn("SKIPPING: Cannot dump locations, because none were found.");
    }

    // from here, expect the twitter worker to read this data from the cache or
    // the database ...
    console.log("DONE.");
    process.exit(0);
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
