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
 */
require("dotenv").config();
const fetch = require("node-fetch");
const url = "https://api.twitter.com/1.1/trends/place.json?id=2442327";
