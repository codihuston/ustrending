/**
 * NOTE: dev environment builds a docker image and uses it with skaffold/k8s.
 * In production, this will likely be deployed in a separate cluster/standalone
 * instance (it doesn't need to be replciated).
 * 
 * TODO: 
 * 1. [] connect to redis
 * 2. [] create cronjob, runs every X minutes
 *    2a. [] query google trends explorer (~20 requests) -> gets each trend
 *    2b. [] query google trends geocompare (~20 requests) -> gets trend ranking
 *        by state
 * 3. [] process trend/state rankings for clients to use
 * 4. [] store to redis
 */
const Redis = require("ioredis");
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

client.on("ready", function(){
  console.log("Redis connection ready!");
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