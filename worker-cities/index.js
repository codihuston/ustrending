/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replciated).
 *
 * 1. [] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [] query census (cities by population) -> population data MAY be used
 *        to determine how to aggregate state-wide trending data on twitter
 *    2a. [] query yahoo (for WOEID, LONG/LAT)
 * 3. [] process city/state data into the following example:
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
 * 4. [] store to redis / persist elsewhere?
 */
require("dotenv").config();
