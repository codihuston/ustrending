// C:\Users\Codi\git\ustrending\worker-twitter-trends\debug\trends-available-response.json
const express = require("express");
const debug = require("debug")("private-api:index");
const router = express.Router();

const twitterPlaces = require("../temp/trends-available-response.json");
const { Place } = require("../models/place");
const { initCache } = require("../db");
const TwitterController = require("../controllers/twitter");
const YahooAPI = require("../api/yahoo");
const { sleep } = require("../lib/utils");

function methodThatReturnsAPromise(nextID) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Resolve! ${new Date()}`);

      resolve(nextID);
    }, 1000);
  });
}

/**
 *
 */
router.get("/places", async function (req, res, next) {
  try {
    res.json(await TwitterController.getPlaces());
  } catch (e) {
    next(e);
  }
  // try {
  //   /**
  //    * TODO:
  //    * - for each twitter place
  //    *    - find matching woeid in mongodb (to get its long/lat)
  //    *    - set the log/lat on this object
  //    *    - store in new collection (twitterPlaces || places)
  //    *
  //    * - for locations whose data I do not have... I need to get it. I
  //    * will then configure the worker-cities service to fetch all
  //    * "twitterPlaces" from mongo, feed them to the Yahoo API, and update
  //    * those objects only (do NOT store them in the locations collection, where
  //    * I keep the US locations data, which is NOT going to be used in
  //    * production)
  //    */
  //   twitterPlaces.reduce((p, place) => {
  //     return p.then(async () => {
  //       console.log(`LOOP! ${new Date()}`, place.name);

  //       const uri = YahooAPI.getUriByWoeid(place.woeid);
  //       const {
  //         name,
  //         placeType,
  //         url,
  //         parentid,
  //         country,
  //         woeid,
  //         countryCode,
  //       } = place;

  //       console.log("Sending response to: ", uri);

  //       const result = await YahooAPI.getForecast(uri);
  //       const { location } = result;

  //       // verify that there is location data
  //       if (result && location && Object.keys(location).length) {
  //         const { region, timezone_id, lat, long } = location;

  //         // build mongo queries
  //         const query = {
  //           woeid,
  //         };
  //         const update = {
  //           name,
  //           placeType,
  //           url,
  //           parentid,
  //           country,
  //           woeid,
  //           countryCode,
  //           // custom fields
  //           region: region ? region.trim() : "",
  //           timezone_id,
  //           geo: {
  //             type: "Point",
  //             coordinates: [long, lat],
  //           },
  //           woeid,
  //           yahooUri: uri,
  //         };
  //         const options = {
  //           upsert: true,
  //           new: true,
  //           setDefaultsOnInsert: true,
  //         };

  //         console.log(query, update, options);

  //         // upsert place in mongodb, return as plain JSON
  //         const newInstance = await Place.findOneAndUpdate(
  //           query,
  //           update,
  //           options
  //         ).lean();
  //       } // end if
  //       else {
  //         console.log(
  //           "No response from YahooAPI for",
  //           place.name,
  //           place.country
  //         );
  //       }
  //       return await sleep(1000);
  //     });
  //   }, Promise.resolve());

  //   res.json({
  //     message: "DONE!",
  //   });
  //   console.log("DONE");
  // } catch (e) {
  //   next(e);
  // }
});

router.get("/:woeid", async function (req, res, next) {
  try {
    /**
     * TODO:
     * - for each twitter place
     *    - find matching woeid in mongodb (to get its long/lat)
     *    - set the log/lat on this object
     *    - store in new collection (twitterPlaces || places)
     *
     * - for locations whose data I do not have... I need to get it. I
     * will then configure the worker-cities service to fetch all
     * "twitterPlaces" from mongo, feed them to the Yahoo API, and update
     * those objects only (do NOT store them in the locations collection, where
     * I keep the US locations data, which is NOT going to be used in
     * production)
     */
    const uri = YahooAPI.getUriByWoeid(req.params.woeid);
    const result = await YahooAPI.getForecast(uri);

    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
