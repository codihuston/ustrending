// getting-started.js
const Redis = require("ioredis");
const mongoose = require("mongoose");

let cacheClient = null;
const { Location } = require("../models/location");

/**
 * Handles the connection to redis and mongodb.
 */
module.exports.initCache = function (app) {
  if (cacheClient) {
    return cacheClient;
  }
  console.log("CACHE: initializing connection...");

  const client = new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
    password: process.env.REDIS_PASSWORD, // Redis password
    db: process.env.REDIS_DB, // Redis DB
  });

  client.on("connect", function () {
    console.log("CACHE: connected!");
  });

  client.on("ready", async function () {
    console.log("CACHE: ready!");

    app.emit("cache-connected");
    cacheClient = client;
    return true;
  });

  client.on("close", function () {
    console.warn("CACHE: connection closed!");
  });

  client.on("reconnecting", function () {
    console.warn("CACHE: reconnecting...");
  });

  client.on("error", function (error) {
    console.error(error);
    // process.exit(error.errno);
  });
};

function getConnectionString() {
  let credentialString = "";
  const {
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB,
    MONGO_USERNAME,
    MONGO_PASSWORD,
  } = process.env;
  if (MONGO_USERNAME && MONGO_PASSWORD) {
    credentialString = `${MONGO_USERNAME}:${MONGO_PASSWORD}@`;
  }

  const str = `mongodb://${credentialString}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
  const safeStr = `mongodb://${
    credentialString ? "REDACTED:" : ""
  }${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

  return [str, safeStr];
}

/**
 * Emits a "db-connected" event when a connection is established.
 * Does not return a handle to the database instance; simply
 * import mongoose or its models wherever it is needed, and it
 * should just work.
 *
 * @param {*} app : express app
 */
module.exports.initDb = function (app) {
  mongoose.set("useFindAndModify", false);

  const [uri, safeUri] = getConnectionString();

  console.log("DATABASE: initializing connection...", safeUri);

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on("connected", function () {
    console.log("DATABASE: Connected!");
    app.emit("db-connected");
  });

  db.on("error", function (error) {
    console.error(error);
  });

  db.on("disconnected", function () {
    console.warn("DATABASE: Disconnected!!");
  });
};
