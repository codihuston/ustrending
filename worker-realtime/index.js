const googleTrends = require('google-trends-api');

googleTrends.realTimeTrends({ geo: "US" }, function(err, results){
  if(err){
    console.error(error);
  }else{
    console.log(results);
  }
});