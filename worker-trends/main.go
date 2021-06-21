package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/groovili/gogtrends"
	"github.com/robfig/cron/v3"
	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/worker-trends/database"
	"github.com/codihuston/ustrending/worker-trends/types"
)

var geoMaps = make(map[string][]*gogtrends.GeoMap, 0)
var httpClient = &http.Client{Timeout: 10 * time.Second}
var configMap = make(map[string]int, 0)

const (
	DEFAULT_IS_GOOGLE_ENABLED          = 0
	DEFAULT_MAX_GOOGLE_REALTIME_TRENDS = 25
)

func min(x, y int) int {
	if x > y {
		return y
	}
	return x
}

func getAPIString() string {
	return fmt.Sprintf("http://%s:%s", os.Getenv("TRENDS_API_HOST"), os.Getenv("TRENDS_API_PORT"))
}

/*
Gets and processes google daily trends sorted by popularity per region.

- [X] Rate limit friendly
	- [X] Get realtime trends via HTTP, store locally (ranked #1 - X), where
	  X is whatever number of trends that the API returns
	- [X] For each trend
		- [X] Insert each topic (split on comma) into in redis queue
*/
func doGoogleDailyTrends() {
	var trendingTopics []string
	var queueKey = "google-daily-trends-queue"
	var cacheKey = "google-daily-trends-by-state"
	var jobName = "doGoogleDailyTrends"

	if configMap["IS_GOOGLE_ENABLED"] == 0 {
		log.Warn("Google processing is DISABLED! Skipping...")
		return
	}

	trends, err := getGoogleDailyTrends()

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	if err != nil {
		log.Errorf("Failed to get daily trends from API... aborting job '%s'! %s", jobName, err)
		return
	}

	// empty the queue out prior to appending to it
	_, err = database.CacheClient.Del(ctx, queueKey).Result()

	if err != nil {
		log.Errorf("Failed to get empty queue '", queueKey, "'... aborting job '%s'! %s", jobName, err)
		return
	}

	// for each trending story
	for i := 0; i < min(len(trends), configMap["MAX_GOOGLE_REALTIME_TRENDS"]); i++ {
		trend := trends[i]
		// split realtimeTrend.Title by commas
		trendingTopics = append(trendingTopics, trend.Title.Query)
	}

	// convert []string into []interface{} for redis client LPUSH
	s := make([]interface{}, len(trendingTopics))
	for i, v := range trendingTopics {
		if i > configMap["MAX_GOOGLE_REALTIME_TRENDS"]-1 {
			log.Info("Exceeded")
		}
		s[i] = strings.TrimSpace(v)
	}

	// push each onto a queue in redis
	_, err = database.CacheClient.LPush(ctx, queueKey, s...).Result()

	if err != nil {
		log.Errorf("Error queueing topics: '%s'... aborting job '%s'! %s", trendingTopics, jobName, err)
	} else {
		log.Info("[", len(trendingTopics), "] Topics queued at '", queueKey, "': ", trendingTopics)
	}

	// RATE LIMITED: get the geo maps (interest by region) for each trend
	geoMaps, err := getGoogleRealtimeTrendsGeoMaps(ctx, queueKey, 1*time.Second)

	if err != nil {
		log.Error("Failed to process google real time trends:", err)
	}

	// now process each trending story into a []State
	result := getGeoMapsAsStates(trendingTopics, &geoMaps)

	// and cache it
	log.Info("=== Final result! ===")
	log.Info(result)
	log.Info("=== End final result! ===")

	jsonMap, _ := json.Marshal(result)
	ttl := time.Second * 0
	err = database.CacheClient.Set(ctx, cacheKey, jsonMap, ttl).Err()
	if err != nil {
		log.Error(err)
	}
}

func getGoogleDailyTrends() ([]*gogtrends.TrendingSearch, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/daily"
	var result []*gogtrends.TrendingSearch

	log.Info("Querying uri:", uri)

	// query the api; do nothing with the response
	r, err := httpClient.Get(uri)

	// handle error
	if err != nil {
		log.Error(err)
		return result, err
	}

	// handle non 200 http codes
	if r.StatusCode != 200 {
		return result, errors.New(r.Status)
	}

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return result, err
	}

	// append each result here in a map: {woeid: []trends}
	json.Unmarshal([]byte(body), &result)

	return result, err
}

/*
Gets and processes google realtime trends sorted by popularity per region.

- [X] Rate limit friendly
	- [X] Get realtime trends via HTTP, store locally (ranked #1 - X), where
	  X is whatever number of trends that the API returns
	- [X] For each trend
		- [X] Insert each topic (split on comma) into in redis queue
*/
func doGoogleRealtimeTrends() {
	var trendingTopics []string
	var queueKey = "google-realtime-trends-queue"
	var cacheKey = "google-realtime-trends-by-state"

	if configMap["IS_GOOGLE_ENABLED"] == 0 {
		log.Warn("Google processing is DISABLED! Skipping...")
		return
	}

	realtimeTrends, err := getGoogleRealtimeTrends()

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	if err != nil {
		log.Error("Failed to get realtime trends from API... aborting job! ", err)
		return
	}

	// empty the queue out prior to appending to it
	_, err = database.CacheClient.Del(ctx, queueKey).Result()

	if err != nil {
		log.Error("Failed to empty out the queue '", queueKey, "'... aborting job! ", err)
		return
	}

	// for each trending story
	var counter = 0
	for i := 0; i < len(realtimeTrends); i++ {
		// stop processing trends if we've processed to many
		if counter > configMap["MAX_GOOGLE_REALTIME_TRENDS"]-1 {
			log.Info("Number of realtime trends exceeds MAX_GOOGLE_REALTIME_TRENDS [", configMap["MAX_GOOGLE_REALTIME_TRENDS"], "]... done parsing trends-to-be-processed!")
			break
		}

		realtimeTrend := realtimeTrends[i]
		// split realtimeTrend.Title by commas
		topics := strings.Split(realtimeTrend.Title, ",")

		// clean up spaces between each topic
		for _, v := range topics {
			// stop processing trends if we've processed to many
			if counter > configMap["MAX_GOOGLE_REALTIME_TRENDS"]-1 {
				break
			}

			trendingTopics = append(trendingTopics, strings.TrimSpace(v))

			// count # of trends processed so far
			counter++
		}
	}

	// convert []string into []interface{} for redis client LPUSH
	s := make([]interface{}, len(trendingTopics))
	for i, v := range trendingTopics {
		s[i] = strings.TrimSpace(v)
	}

	// push each onto a queue in redis
	_, err = database.CacheClient.LPush(ctx, queueKey, s...).Result()

	if err != nil {
		log.Error("Error queueing topics: '", trendingTopics, "... aborting job! Error: ", err)
	} else {
		log.Info("[", len(trendingTopics), "] Topics queued at '", queueKey, "': ", trendingTopics)
	}

	// RATE LIMITED: get the geo maps (interest by region) for each trend
	geoMaps, err := getGoogleRealtimeTrendsGeoMaps(ctx, queueKey, 1*time.Second)

	if err != nil {
		log.Error("Failed to process google real time trends:", err)
	}

	// now process each trending story into a []State
	result := getGeoMapsAsStates(trendingTopics, &geoMaps)

	// and cache it
	log.Info("=== Final result! ===")
	log.Info(result)
	log.Info("=== End final result! ===")

	jsonMap, _ := json.Marshal(result)
	ttl := time.Second * 0
	err = database.CacheClient.Set(ctx, cacheKey, jsonMap, ttl).Err()
	if err != nil {
		log.Error(err)
	}
}

/*
Fetches the list of google realtime trends
*/
func getGoogleRealtimeTrends() ([]*gogtrends.TrendingStory, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/realtime"
	var result []*gogtrends.TrendingStory

	log.Info("Querying uri:", uri)

	// query the api; do nothing with the response
	r, err := httpClient.Get(uri)

	// handle error
	if err != nil {
		log.Error(err)
		return result, err
	}

	// handle non 200 http codes
	if r.StatusCode != 200 {
		return result, errors.New(r.Status)
	}

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return result, err
	}

	// append each result here in a map: {woeid: []trends}
	json.Unmarshal([]byte(body), &result)

	return result, err
}

/*
* Pops a keyword from the cache and returns the interest by region from google
*
*	- [x] On a delta of 1s, pop a trend from queue until empty
*		- [X] HTTP GET Explore the trend + InterestsByRegion at /google/explore?keyword=, geo=, time=,
*			- [X] return an instance of a State Append to []State in worker (sorting after each response)
*			- [X] Cache the result: google-realtime-trends-by-state
*		- [X] After all trends processed, HTTP GET my result from cache at /google/realtime/trends/state
*			- cacheKey: google-realtime-trends-by-state
 */
func getGoogleRealtimeTrendsGeoMaps(ctx context.Context, queueKey string, seconds time.Duration) (map[string][]*gogtrends.GeoMap, error) {

	// while the queue is not empty
	var counter = 0
	for true {
		var queueLength int64

		// sanity check, but this should already be handled upstream
		// stop processing if we've exceeded the max configuration of trends to process
		if counter > configMap["MAX_GOOGLE_REALTIME_TRENDS"]-1 {
			log.Info("Number of realtime trends exceeds MAX_GOOGLE_REALTIME_TRENDS [", configMap["MAX_GOOGLE_REALTIME_TRENDS"], "]... stopping queue processing!")
			break
		}

		queueLength, err := database.CacheClient.LLen(ctx, queueKey).Result()

		if err != nil {
			return geoMaps, err
		}

		if queueLength <= 0 {
			log.Info("Queue '", queueKey, "' is empty, done processing!")
			break
		} else {
			log.Info("Queue '", queueKey, "' len=", queueLength)
		}

		// get a trend
		trend, err := database.CacheClient.RPop(ctx, queueKey).Result()

		if err != nil {
			log.Error("Error processing from queue: RPOP failed with:", err)
		} else {
			log.Info("Dequeueing topic: ", trend)
		}

		// process it
		loc := "US"
		timePeriod := "now 1-d"
		lang := "EN"
		geoMap, err := getInterestByRegion(trend, loc, timePeriod, lang)

		// put it into my map of geoMaps: topic => [geoMaps]
		geoMaps[trend] = geoMap

		log.Info("Got geoMap for trend '", trend, "' len=", len(geoMap))

		// sleep for 1 second
		time.Sleep(seconds)
		counter++
	}

	return geoMaps, nil
}

// sorts each topic by popularity per region
func getGeoMapsAsStates(trendingTopics []string, geoMaps *map[string][]*gogtrends.GeoMap) []types.State {
	var temp = make(map[string][]types.StateTrend, 51) // num states
	var results []types.State

	log.Info("There are [", len(trendingTopics), "] trending topics: ", trendingTopics)
	log.Info("There are [", len(*geoMaps), "] entries in geoMaps")

	// safely iterate over the smallest list (they should be same length)
	for i := 0; i < min(len(trendingTopics), len(*geoMaps)); i++ {
		// assuming there is exactly the same # of geoMaps as dts
		trend := (trendingTopics)[i]
		// geo maps are mapped to the trend query, each trend should have a map
		val, ok := (*geoMaps)[trend]
		var geoMap []*gogtrends.GeoMap

		// confirm that there exists a geomap
		if !ok {
			log.Warnf("A geomap does not exist for query: %s", trend)
			continue
		}

		// if there is a geomap, use it
		if len(val) > 0 {
			geoMap = val
		} else {
			log.Warnf("A geomap exists for query: %s, but does not have a length (len=%d)", trend)
			continue
		}

		log.Infof("Processing geomap for '%s' (len=%d)", trend, len(geoMap))

		// map the geo map for each topic into a list
		for j := 0; j < len(geoMap); j++ {
			// get geo data
			location := *geoMap[j]
			// build output object
			st := types.StateTrend{
				GeoCode: location.GeoCode,
				Topic:   trend,
				Value:   location.Value[0],
			}
			// add output object to this state
			temp[location.GeoName] = append(temp[location.GeoName], st)
			// sorted by value (rank), ascending
			sort.Slice(temp[location.GeoName], func(i, j int) bool {
				return temp[location.GeoName][i].Value > temp[location.GeoName][j].Value
			})
		}
	} // end for

	// now that the map is complete, convert it to []State
	// we used a map so that we could quickly append trends to it
	for stateName, trends := range temp {
		state := types.State{
			Name:   stateName,
			Trends: trends,
		}
		results = append(results, state)
	}
	return results
}

func getInterestByRegion(keyword, loc, timePeriod, lang string) ([]*gogtrends.GeoMap, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/interest"
	var results []*gogtrends.GeoMap

	// build http request with encoded query string
	client := &http.Client{}
	req, _ := http.NewRequest("GET", uri, nil)
	q := req.URL.Query()
	q.Add("keyword", keyword)
	q.Add("loc", loc)
	q.Add("time", timePeriod)
	q.Add("lang", lang)
	req.URL.RawQuery = q.Encode()

	log.Info("Querying uri:", req.URL.String())

	// query the
	r, err := client.Do(req)

	// handle error
	if err != nil {
		log.Error(err)
		return nil, err
	}

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return nil, err
	}

	json.Unmarshal(body, &results)

	return results, nil
}

func getPlaces() ([]types.Place, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/places/US"
	var results []types.Place

	log.Info("Querying uri:", uri)

	// query the api
	r, err := httpClient.Get(uri)

	// handle error
	if err != nil {
		return nil, err
	}

	// handle non 200 http codes
	if r.StatusCode != 200 {
		return nil, errors.New(r.Status)
	}

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return nil, err
	}

	json.Unmarshal([]byte(body), &results)

	return results, nil
}

func initialize() {
	log.Info("Initializing environment variables...")

	setConfigMapValue("IS_GOOGLE_ENABLED", DEFAULT_IS_GOOGLE_ENABLED)
	setConfigMapValue("MAX_GOOGLE_REALTIME_TRENDS", DEFAULT_MAX_GOOGLE_REALTIME_TRENDS)

	log.Info("IS_GOOGLE_ENABLED: ", configMap["IS_GOOGLE_ENABLED"])
	log.Info("MAX_GOOGLE_REALTIME_TRENDS: ", configMap["MAX_GOOGLE_REALTIME_TRENDS"])
	log.Info("Connecting to services...")

	database.InitializeCache()

	log.Info("Connected!")
}

// setConfigMapValue sets a configMap value to the corresponding environment variable, or a default value
func setConfigMapValue(key string, defaultValue int) {
	if len(os.Getenv(key)) > 0 {
		var result int
		var err error
		result, err = strconv.Atoi(os.Getenv(key))
		if err != nil {
			log.Error(err)
			configMap[key] = defaultValue
		}
		configMap[key] = result
	} else {
		log.Info("Using Default value")
		configMap[key] = defaultValue
	}
}

func main() {
	// init services
	initialize()

	// run the commands immediately
	log.Println("Run initial request")
	doGoogleDailyTrends()
	doGoogleRealtimeTrends()
	log.Println("DONE with initial requests")

	// configure schedules for re-runs
	c := cron.New()

	// update google daily trends every 30 minutes
	c.AddFunc("*/30 * * * *", func() {
		log.Println("Every minute: Get Google Trends ")

		doGoogleDailyTrends()
	})

	// update google realtime trends every 30 minutes
	c.AddFunc("*/30 * * * *", func() {
		log.Println("Every minute: Get Google Realtime Trends ")

		doGoogleRealtimeTrends()
	})

	// start cronjobs
	c.Start()

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)

	<-termChan // Blocks here until interrupted

	// Handle shutdown
	log.Println("*********************************\nShutdown signal received\n*********************************")
	log.Println("Shutting down!")
}
