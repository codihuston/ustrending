const fs = require("fs");
const path = require("path");
const debug = require("debug")("worker:widget-data");
const fetch = require("node-fetch");

const utils = require("./utils");

const GOOGLE_TRENDING_COMPARE_GEO_URI =
  "https://trends.google.com/trends/api/widgetdata/comparedgeo";
  
/*******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Step 3 of 5: Takes required parameters gathered from the Google Trends API,
 * its and its Explorer API (for each of the trends), and use those
 * responses to invoke the ComparedGeo API
 *
 * Returns a json-ized response from the API
 * 
 * @param {*} opts [{
 *  exploreResponse,
 *  comparedGeoRequest,
 *  token,
 *  memoryStoreKey
 * }]
 * @returns [<promise>{
 *  default: { geoMapData: [Array]}
 * }]
 */
module.exports.comparedGeo = async function (exploredTrends) {
  const promises = [];

  for(trend of exploredTrends){
    promises.push(comparedGeoForTrend(trend));
  }

  return Promise.all(promises);
}

/*******************************************************************************
 * Private API
 ******************************************************************************/

function comparedGeoForTrend(opts){
  return new Promise( async (resolve, reject) => {
    const { comparedGeoRequest, token, memoryStoreKey } = opts;
  
    if (!comparedGeoRequest || !token || !memoryStoreKey) {
      throw new Error(
        "A required value is not set (comparedGeoRequest, token, memoryStoreKey)!"
      );
    }
  
    // build the uri
    const uri =
      GOOGLE_TRENDING_COMPARE_GEO_URI +
      utils.getQueryString({
        req: comparedGeoRequest,
        token,
      });
  
    debug("Compared Geo URI", uri);
  
    try {
      // get / download the file
      const res = await fetch(uri);
  
      // stream response into memory
      const wstream = new utils.WriteableMemoryStream(memoryStoreKey);
  
      // TODO: when this is complete, we ultimately need to return it to the
      // line that invokes `await explorer.exploreTrends(dailyTrends)`
      wstream.on("finish", function () {
        debug(`Finished writing to memoryStore[${memoryStoreKey}]`);
        resolve(utils.getMemoryStoreKeyAsObject(memoryStoreKey));
      });
  
      // write it to our memory store
      res.body.pipe(wstream);
      debugResponse(res, memoryStoreKey);

    } catch (e) {
      console.error("Failed to process widget-data for:", memoryStoreKey)
      reject(e);
    }
  }); // end promise
}

function debugResponse(explorerAPIResponse, memoryStoreKey) {
  if (process.env.NODE_ENV == "development") {
    const outputPath = path.resolve(__dirname, `../debug`, `${memoryStoreKey}-widgetdata-comparedgeo.txt`);
    
    debug("DEBUG: Writing output to: ", outputPath);

    // write explorer response to file system
    const dest = fs.createWriteStream(outputPath);

    // pipe response into the file
    explorerAPIResponse.body.pipe(dest);
  }
}
