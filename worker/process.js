/**
 * Step 4 of 5: process this into client-usable data; requires geographic
 * trending data for each trend (obtained from the widget-data GeoCompared API)
 * 
 * US STATE => [trend #1, trend #2]
 */
const {resolve} = require('path');
const fs = require('fs');

const TRENDING_LIMIT = 20;

function getMemoryStoreKey(str){
  return str.toString().replace(/.*\n/, "");
}

function getFileContentsAsJson(str){
  return JSON.parse(getMemoryStoreKey(str));
}

const trendingResponse = JSON.parse(fs.readFileSync(resolve(__dirname, `_trendingResponse.json`)));

/**
 * We want results to contain the states, and an array of trending topics
 * States => {Topic => State Ranking}
 * 
 * Then, I want to display:
 * State => Topics in order of ranking
 */
const results = new Map();

// read trending ranking for each state
for(let i=0; i < TRENDING_LIMIT; i++){
  const file = resolve(__dirname, `${i+1}-geocompare.txt`);
  const raw = fs.readFileSync(file);
  const data = getFileContentsAsJson(raw)
  const topic = trendingResponse.default.trendingSearchesDays[0].trendingSearches[i];

  console.log(`Trending Topic #${i+1}: ${topic.title.query}`, topic)
  console.log(data);
  
  // for each state, calculate the top trending topic (for now, increase to 3+ later)
  for(const [index, state] of data.default.geoMapData.entries()){
    // state does not exist in map
    if(!results.has(state.geoName)){
      // simply init this value
      results.set(state.geoName, [{
        topic: topic.title.query,
        value: state.hasData && state.value[0] || 0,
        geoCode: state.geoCode
      }])
    }
    // state exists in map
    else{
      // compare what is in the results, to state.value[]
      const value = state.hasData && state.value[0] || 0;
      let z = 0;
      // console.log(results.get(state.geoName));
      results.set(state.geoName, results.get(state.geoName).concat({topic: topic.title.query, value,
        geoCode: state.geoCode}).sort(function(a,b){
        if(a.value > b.value){
          return -1;
        }
        return 1;
      }))
    }
  }
} // end for

console.log("results ->", resolve(__dirname, "_trendingByState.json"), results);

if(process.env.NODE_ENV === "debug"){
  console.log("Writing output...", results.keys());
  Map.prototype.toJSON = function(){ return [...this]}
  fs.writeFileSync(resolve(__dirname, "_trendingByState.json"), JSON.stringify(results));
}