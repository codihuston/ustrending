/**
 * Step 4 of 5: process this into client-usable data; requires geographic
 * trending data for each trend (obtained from the widget-data GeoCompared API)
 * 
 * US STATE => [trend #1, trend #2]
 */
const debug = require("debug")("worker:processor");
const fs = require("fs");
const path = require("path");

const defaults = require("./defaults");

// only look at top # trends
const TRENDING_LIMIT =
  parseInt(process.env.MAX_TREND_LIMIT) || defaults.MAX_TREND_LIMIT;

/*******************************************************************************
 * Public API
 ******************************************************************************/

 /**
  * Processes data from the Google Trends API and the associated geography
  * for the region and returns a JS Map object.
  * 
  * @param {*} dailyTrends 
  * @param {*} comparedGeo 
  * @returns Map
  */
module.exports.process = function(dailyTrends, comparedGeo){
  // const trendingResponse = JSON.parse(fs.readFileSync(resolve(__dirname, `_trendingResponse.json`)));

  // get the most recent trending searches from the given daily trends response
  const dt = dailyTrends.default?.trendingSearchesDays?.[0]?.trendingSearches;
  debug("Count of given daily trends:", dt.length);

  if (!dt) {
    throw new Error("No daily trends given -- cannot enumerate them.");
  }
  if(!comparedGeo || !comparedGeo.length){
    throw new Error("No geoCompared data -- cannot process trends without data.")
  }

  /**
   * We want results to contain the states, and an array of trending topics
   * States => {Topic => State Ranking}
   * 
   * Then, I want to display:
   * State => Topics in order of ranking
   */
  const results = new Map();

  // read trending ranking for each state
  //for(let i=0; i < TRENDING_LIMIT; i++){
    
  for (const [index, topic] of dt.entries()) {
    // const file = resolve(__dirname, `${i+1}-geocompare.txt`);
    // const raw = fs.readFileSync(file);
    // const data = getFileContentsAsJson(raw)
    const data = comparedGeo[index];
    const trendingRank = index + 1;
    
    if (trendingRank > TRENDING_LIMIT) {
      console.warn(
        `Breaking prematurely: TRENDING LIMIT [${TRENDING_LIMIT}] exceeded, currently: ${trendingRank}`
      );
      break;
    }

    debug(`Trending Topic #${index+1}: ${topic.title.query}`, topic)

    if(!topic){
      console.warn("No geographical data found for this topic!");
    }

    debug(`Topic's ComparedGeo Data:`, data);
    
    // for each state, calculate the top trending topic (for now, increase to 3+ later)
    for(const [index, state] of data.default.geoMapData.entries()){

      debug(`Data for State:`, state);

      // state does not exist in map
      if(!results.has(state.geoName)){
        // simply init this value
        results.set(state.geoName, [{
          topic: topic.title.query,
          value: state.hasData && state.value[0] || 0,
          geoCode: state.geoCode
        }])

        debug(`Init map key for [${state.geoName}]`)
      }
      // state exists in map
      else{
        debug(`Update map key for [${state.geoName}]`)
        // compare what is in the results, to state.value[]
        const value = state.hasData && state.value[0] || 0;
        let z = 0;
        // debug(results.get(state.geoName));
        results.set(state.geoName, results.get(state.geoName).concat({topic: topic.title.query, value,
          geoCode: state.geoCode}).sort(function(a,b){
          if(a.value > b.value){
            return -1;
          }
          return 1;
        }))
      }
    } // end for
  } // end for

  debugResponse(results);

  return results;
}
/*******************************************************************************
 * Private API
 ******************************************************************************/
function debugResponse(results) {
  if(process.env.NODE_ENV === "development"){
    const outputPath = path.resolve(__dirname, `../debug`, "client-ready-output.json");

    debug("DEBUG: Writing output to ", outputPath);

    Map.prototype.toJSON = function(){ return [...this]}
    fs.writeFileSync(outputPath, JSON.stringify(results));
  }
}