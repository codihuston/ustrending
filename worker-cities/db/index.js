// getting-started.js
require("dotenv").config("../.env");
const debug = require("debug")("worker-cities:db");

const mongoose = require("mongoose");

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

function connect() {
  return new Promise((resolve, reject) => {
    try {
      const [uri, safeUri] = getConnectionString();

      debug("MongoDB: Attempting to connect to: ", safeUri);

      mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const db = mongoose.connection;

      db.on("error", function (error) {
        reject(error);
      });

      db.on("connected", function () {
        debug("MongoDB: Connected to mongo!");
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

module.exports.connect = connect;
