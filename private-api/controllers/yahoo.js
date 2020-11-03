const debug = require("debug")("private-api:yahoo-ctrl");

const { initCache } = require("../db");
const YahooAPI = require("../lib/yahoo");

module.exports.getWeather = async function (woeid) {
  try {
    const client = initCache();

    if (!woeid) {
      next(new Error("Expected parameter 'woeid'."));
    } else {
      let CACHE_KEY = `yahoo:weather:${woeid}`;
      const cache = await client.get(CACHE_KEY);

      if (cache) {
        debug("CACHE HIT!");
        return JSON.parse(cache);
      } else {
        const uri = YahooAPI.getUriByWoeid(woeid);
        const result = await YahooAPI.getForecast(uri);
        await client.set(CACHE_KEY, JSON.stringify(result), "ex", 3600);
        return result;
      }
    }
  } catch (e) {
    throw e;
  }
};
