package main

import (
	"context"
	"encoding/json"
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

	"github.com/dghubble/go-twitter/twitter"
	"github.com/go-redis/redis/v8"
	"github.com/groovili/gogtrends"
	"github.com/robfig/cron/v3"
	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/worker-trends/database"
	"github.com/codihuston/ustrending/worker-trends/types"
)

var httpClient = &http.Client{Timeout: 10 * time.Second}

// TODO: use me?
func getJson(url string, target interface{}) error {
	r, err := httpClient.Get(url)
	if err != nil {
		return err
	}
	defer r.Body.Close()

	return json.NewDecoder(r.Body).Decode(target)
}

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
	trends, err := getGoogleDailyTrends()
	var queueKey = "google-daily-trends-queue"
	var cacheKey = "google-daily-trends-by-state"

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	if err != nil {
		log.Fatal("Failed to get daily trends from API... aborting job! ", err)
		return
	}

	// empty the queue out prior to appending to it
	_, err = database.CacheClient.Del(ctx, queueKey).Result()

	if err != nil {
		log.Fatal("Failed to get empty queue '", queueKey, "'... aborting job! ", err)
		return
	}

	// for each trending story
	for i := 0; i < len(trends); i++ {
		trend := trends[i]
		// split realtimeTrend.Title by commas
		trendingTopics = append(trendingTopics, trend.Title.Query)
	}

	// convert []string into []interface{} for redis client LPUSH
	s := make([]interface{}, len(trendingTopics))
	for i, v := range trendingTopics {
		s[i] = strings.TrimSpace(v)
	}

	// push each onto a queue in redis
	_, err = database.CacheClient.LPush(ctx, queueKey, s...).Result()

	if err != nil {
		log.Fatal("Error queueing topics: '", trendingTopics, "... aborting job! Error: ", err)
	} else {
		log.Info("[", len(trendingTopics), "] Topics queued at '", queueKey, "': ", trendingTopics)
	}

	// RATE LIMITED: get the geo maps (interest by region) for each trend
	geoMaps, err := getGoogleRealtimeTrendsGeoMaps(ctx, queueKey, 1*time.Second)

	if err != nil {
		log.Fatal("Failed to process google real time trends:", err)
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
		log.Fatal(err)
	}
}

// TODO: refactor this, take any interface{} of which to feed results into
// Replace this function, and getDailyRealtimeTrends() with this new function.
func getGoogleDailyTrends() ([]*gogtrends.TrendingSearch, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/daily"
	var result []*gogtrends.TrendingSearch

	log.Info("Querying uri:", uri)

	// query the api; do nothing with the response
	r, err := httpClient.Get(uri)

	// handle error
	if err != nil {
		log.Fatal(err)
		return result, err
	}
	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return result, err
	}

	// append each result here in a map: {woeid: []trends}
	json.Unmarshal([]byte(body), &result)

	// assume successful
	log.Info("Query successful!")
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
	realtimeTrends, err := getGoogleRealtimeTrends()
	var queueKey = "google-realtime-trends-queue"
	var cacheKey = "google-realtime-trends-by-state"

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	if err != nil {
		log.Fatal("Failed to get realtime trends from API... aborting job! ", err)
		return
	}

	// empty the queue out prior to appending to it
	_, err = database.CacheClient.Del(ctx, queueKey).Result()

	if err != nil {
		log.Fatal("Failed to get empty queue '", queueKey, "'... aborting job! ", err)
		return
	}

	// for each trending story
	for i := 0; i < len(realtimeTrends); i++ {
		realtimeTrend := realtimeTrends[i]
		// split realtimeTrend.Title by commas
		topics := strings.Split(realtimeTrend.Title, ",")

		// clean up spaces between each topic
		for _, v := range topics {
			trendingTopics = append(trendingTopics, strings.TrimSpace(v))
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
		log.Fatal("Error queueing topics: '", trendingTopics, "... aborting job! Error: ", err)
	} else {
		log.Info("[", len(trendingTopics), "] Topics queued at '", queueKey, "': ", trendingTopics)
	}

	// RATE LIMITED: get the geo maps (interest by region) for each trend
	geoMaps, err := getGoogleRealtimeTrendsGeoMaps(ctx, queueKey, 1*time.Second)

	if err != nil {
		log.Fatal("Failed to process google real time trends:", err)
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
		log.Fatal(err)
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
		log.Fatal(err)
		return result, err
	}
	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return result, err
	}

	// append each result here in a map: {woeid: []trends}
	json.Unmarshal([]byte(body), &result)

	// assume successful
	log.Info("Query successful!")
	return result, err
}

/*
	- [x] On a delta of 1s, pop a trend from queue until empty
		- [X] HTTP GET Explore the trend + InterestsByRegion at /google/explore?keyword=, geo=, time=,
			- [X] return an instance of a State? Append to []State in worker (sorting after each response)
			- [X] Cache the result: google-realtime-trends-by-state
		- [X] After all trends processed, HTTP GET my result from cache at /google/realtime/trends/state
			- cacheKey: google-realtime-trends-by-state
*/
var geoMaps = make(map[string][]*gogtrends.GeoMap, 0)

// pops a keyword from the cache and returns the interest by region from google
func getGoogleRealtimeTrendsGeoMaps(ctx context.Context, queueKey string, seconds time.Duration) (map[string][]*gogtrends.GeoMap, error) {

	// while the queue is not empty
	for true {
		var queueLength int64

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
			log.Fatal("Error processing from queue: RPOP failed with:", err)
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

	// assume successful
	log.Info("Query successful!")

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

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return nil, err
	}

	json.Unmarshal([]byte(body), &results)

	// assume successful
	log.Info("Query successful!")

	return results, nil
}

// gets all twitter places and their trending topics
func getTwitterTrends() {
	places, err := getPlaces()
	if err != nil {
		log.Fatal(err)
	}

	err = getTwitterTrendsForPlaces(places)
	if err != nil {
		log.Fatal(err)
	}
}

func getTwitterTrendsForPlaces(places []types.Place) error {
	// 14:59 min:seconds
	var cacheKey = "twitter-trends-by-place"
	ttl := time.Second * 899
	m := make(map[int][]twitter.TrendsList)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Info("Get twitter trends for ", len(places), " places")

	// check cache
	_, err := database.CacheClient.Get(ctx, cacheKey).Result()

	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			// fetch trends per place
			for i := 0; i < len(places); i++ {
				place := places[i]
				result, err := getTwitterTrendsByPlace(place.Woeid)

				if err != nil {
					log.Fatal(err)
				}

				m[place.Woeid] = result
			} // end for

			// cache the map into redis: twitter-trends-by-place
			jsonMap, _ := json.Marshal(m)
			err = database.CacheClient.Set(ctx, cacheKey, jsonMap, ttl).Err()
			if err != nil {
				return err
			}
			// end if key !exists
		} else {
			return err
		}
	} else {
		// cache is populated already, no need to re-populate
		log.Info("CACHE HIT: ", cacheKey, ". Skipping operation...")
	}

	log.Info("DONE.")
	return nil
}

func getTwitterTrendsByPlace(woeid int) ([]twitter.TrendsList, error) {
	// for each place
	var uri = getAPIString() + "/twitter/trends/" + strconv.Itoa(woeid)
	var result []twitter.TrendsList
	log.Info("Querying uri:", uri)

	// hit the API endpoint to populate its trends list
	r, err := httpClient.Get(uri)

	// handle error
	if err != nil {
		return result, err
	}

	// read body
	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return result, err
	}

	// append each result here in a map: {woeid: []trends}
	json.Unmarshal([]byte(body), &result)

	log.Info("Query successful!")

	return result, nil
}

func initialize() {
	log.Info("Connecting to services...")
	database.InitializeCache()
}

func main() {
	// init services
	initialize()

	// run the commands immediately
	log.Println("Run initial request")
	doGoogleDailyTrends()
	doGoogleRealtimeTrends()
	getTwitterTrends()
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

	// update twitter trends every 30 minutes
	c.AddFunc("*/30 * * * *", func() {
		log.Println("Every 30 minutes")

		getTwitterTrends()
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
