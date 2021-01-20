package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/go-redis/redis/v8"
	"github.com/robfig/cron/v3"
	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/worker-trends/database"
	"github.com/codihuston/ustrending/worker-trends/types"
)

func getAPIString() string {
	return fmt.Sprintf("http://%s:%s", os.Getenv("TRENDS_API_HOST"), os.Getenv("TRENDS_API_PORT"))
}

func getGoogleTrends() {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/daily/states"

	log.Info("Querying uri:", uri)

	// query the api; do nothing with the response
	_, err := http.Get(uri)

	// handle error
	if err != nil {
		log.Fatal(err)
		return
	}

	// assume successful
	log.Info("Query successful!")
}

func getPlaces() ([]types.Place, error) {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/places/US"
	var results []types.Place

	log.Info("Querying uri:", uri)

	// query the api
	r, err := http.Get(uri)

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
	log.Info("Query successful!", results)

	return results, nil
}

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
	r, err := http.Get(uri)

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

	log.Info(result)

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
	getGoogleTrends()
	getTwitterTrends()
	log.Println("DONE with initial requests")

	// configure schedules for re-runs
	c := cron.New()

	// update google trends every minute
	c.AddFunc("* * * * *", func() {
		log.Println("Every minute: Get Google Trends ")

		getGoogleTrends()
	})

	c.AddFunc("* * * * *", func() {
		log.Println("Every minute: Get Twitter Trends")
		getTwitterTrends()
	})

	c.AddFunc("*/30 * * * *", func() {
		log.Println("Every 30 minutes")

		getGoogleTrends()
	})

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
