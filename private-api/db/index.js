// getting-started.js
const Redis = require("ioredis");
const mongoose = require("mongoose");
const { Location } = require("../models/location");

const cacheClient = new Redis({
  port: process.env.REDIS_PORT, // Redis port
  host: process.env.REDIS_HOST, // Redis host
  family: process.env.REDIS_FAMILY, // 4 (IPv4) or 6 (IPv6)
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB,
});

module.exports.cacheClient = cacheClient;

mongoose.set("useFindAndModify", false);

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

function dbConnect() {
  return new Promise((resolve, reject) => {
    try {
      const [uri, safeUri] = getConnectionString();

      console.log("MongoDB: Attempting to connect to: ", safeUri);

      mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const db = mongoose.connection;

      db.on("error", function (error) {
        reject(error);
      });

      db.on("connected", function () {
        console.log("MongoDB: Connected to mongo!");
        resolve(db);
      });

      db.on("disconnected", function () {
        console.warn("MongoDB: Disconnected from mongo!");
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports.dbConnect = dbConnect;
