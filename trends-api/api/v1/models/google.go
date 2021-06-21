// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"time"

	"github.com/codihuston/ustrending/trends-api/database"
	"github.com/go-redis/redis/v8"
	"github.com/groovili/gogtrends"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

const (
	locUS                           = "US"
	catAll                          = "all"
	langEn                          = "EN"
	DEFAULT_MAX_GOOGLE_DAILY_TRENDS = 10
)

type GoogleTrend struct{}

type StateTrend struct {
	Topic   string `json:"topic" bson:"topic"`
	Value   int    `json:"value" bson:"value"`
	GeoCode string `json:"geoCode" bson:"geo_code"`
}

type State struct {
	Name   string       `json:"name" bson:"name"`
	Trends []StateTrend `json:"trends" bson:"trends"`
}

type GeoMapResponse struct {
	Topic  string
	GeoMap []*gogtrends.GeoMap
}

func min(x, y int) int {
	if x > y {
		return y
	}
	return x
}

// LogGogTrendsError will log a gogtrends error
func LogGogTrendsError(err error, errMsg string) {
	if err != nil {
		log.Error(errors.Wrap(err, errMsg))
	}
}

// PrintGogTrends will log a gogtrends struct
func PrintGogTrends(items interface{}) {
	ref := reflect.ValueOf(items)

	if ref.Kind() != reflect.Slice {
		log.Errorf("Failed to print %s. It's not a slice type.", ref.Kind())
	}

	for i := 0; i < ref.Len(); i++ {
		//MarshalIndent
		empJSON, err := json.MarshalIndent(ref.Index(i).Interface(), "", "  ")
		if err != nil {
			log.Errorf(err.Error())
		}
		fmt.Printf("%s\n", string(empJSON))
		// log.Println(ref.Index(i).Interface())
	}
}

// GetDailyTrends returns an array of gogtrends.TrendingSearch.
func (g GoogleTrend) GetDailyTrends() ([]*gogtrends.TrendingSearch, error) {
	var maxTrends int
	var cacheKey = "daily-trends"
	var proxyKey = cacheKey + "-proxy"
	// 25 minutes
	ttl := time.Second * 1500

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	maxTrends, err := strconv.Atoi(os.Getenv("DEFAULT_MAX_GOOGLE_DAILY_TRENDS"))

	if err != nil {
		log.Warn("Cound not convert 'DEFAULT_MAX_GOOGLE_DAILY_TRENDS' to integer:", os.Getenv("DEFAULT_MAX_GOOGLE_DAILY_TRENDS"), ". Defaulting to: ", DEFAULT_MAX_GOOGLE_DAILY_TRENDS)
		maxTrends = DEFAULT_MAX_GOOGLE_DAILY_TRENDS
	}

	// otherwise fetch from api
	var results []*gogtrends.TrendingSearch

	// check proxy key
	doesProxyKeyExist, err := database.GetProxyKey(ctx, proxyKey)

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()

	// if the cache is empty, or the proxy key has dropped populate it
	if err != nil || !doesProxyKeyExist {
		if err == redis.Nil || !doesProxyKeyExist {
			if !doesProxyKeyExist {
				log.Info("Proxy Key is unset, updating the cache at: ", cacheKey)
			} else {
				log.Info("CACHE MISS:", cacheKey)
			}

			results, err = gogtrends.Daily(ctx, langEn, locUS)

			LogGogTrendsError(err, "Failed to get daily google trends")

			if err != nil {
				return results, err
			}

			// we only want the first "maxTrends" responses, this is to help
			// reduce the number of outgoing requests to their servers...
			var end = min(len(results), maxTrends)
			results = results[:end]

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
			if err != nil {
				panic(err)
			}

			// set the proxy key
			_, err := database.SetProxyKey(ctx, proxyKey, ttl)
			if err != nil {
				return results, err
			}
			// end if key !exists
		} else {
			panic(err)
		}
	} else {
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results, nil
}

func (g GoogleTrend) GetDailyTrendsByState(hl, loc, cat string) ([]State, error) {
	// ensures outgoing requests go out only once in a specific time window
	var cacheKey = "google-daily-trends-by-state"
	var results []State

	ctx := context.Background()

	// first, see if it's time to invalidate/update the caches
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, worker HAS NOT processed data yet
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)
		}
	} else {
		// cache hit, worker HAS processed the data
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results, nil
}

// GetRealtimeTrends returns a list of realtime google trends
func (g GoogleTrend) GetRealtimeTrends(hl, loc, cat string) ([]*gogtrends.TrendingStory, error) {
	var cacheKey = fmt.Sprintf("google-realtime-trends:%s:%s:%s", hl, loc, cat)
	var proxyKey = cacheKey + "-proxy"
	var results []*gogtrends.TrendingStory
	// 25 minutes
	ttl := time.Second * 1500

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check proxy key
	doesProxyKeyExist, err := database.GetProxyKey(ctx, proxyKey)

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()

	// if the cache is empty, or the proxy key has dropped populate it
	if err != nil || !doesProxyKeyExist {
		if err == redis.Nil || !doesProxyKeyExist {
			if !doesProxyKeyExist {
				log.Info("Proxy Key is unset, updating the cache at: ", cacheKey)
			} else {
				log.Info("CACHE MISS:", cacheKey)
			}

			// otherwise fetch from google
			results, err = gogtrends.Realtime(ctx, hl, loc, cat)

			if err != nil {
				return results, err
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
				err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
				if err != nil {
					return results, err
				}
			}

			// set the proxy key
			_, err := database.SetProxyKey(ctx, proxyKey, ttl)
			if err != nil {
				return results, err
			}
			// end if key !exists
		} else {
			return results, err
		}
	} else {
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}

func (g GoogleTrend) GetRealtimeTrendsByState(hl, loc, cat string) ([]State, error) {
	var cacheKey = "google-realtime-trends-by-state"
	var results []State

	ctx := context.Background()

	// first, see if it's time to invalidate/update the caches
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, worker HAS NOT processed data yet
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)
		}
	} else {
		// cache hit, worker HAS processed the data
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results, nil
}

// GetTrendInterest returns an a list of topics and their popularity for the given region (loc)
func (g GoogleTrend) GetTrendInterest(keyword, loc, timePeriod, lang string) ([]*gogtrends.GeoMap, error) {
	var cacheKey = fmt.Sprintf("google-trend-interest:%s:%s:%s:%s", keyword, loc, timePeriod, lang)
	var results []*gogtrends.GeoMap
	// 25 minutes
	ttl := time.Second * 1500
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// first, see if it's time to invalidate/update the caches
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, worker HAS NOT processed data yet
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)

			// get the geo widget from exploring this topic
			widget, err := g.getGeoWidget(ctx, keyword, loc, timePeriod, lang)

			if err != nil {
				return results, err
			}

			// return 404 if a valid widget was not returned
			if widget == nil {
				return results, nil
			}

			// now fetch the interests by location
			results, err = g.getInterestByLocation(ctx, keyword, loc, timePeriod, lang, widget)

			if err != nil {
				return results, err
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
				err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
				if err != nil {
					return results, err
				}
			}
		}
	} else {
		// cache hit, worker HAS processed the data
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}

func (g GoogleTrend) getGeoWidget(ctx context.Context, keyword, loc, timePeriod, lang string) (*gogtrends.ExploreWidget, error) {
	var cacheKey = fmt.Sprintf("google-geowidget:%s:%s:%s:%s", keyword, loc, timePeriod, lang)
	var results *gogtrends.ExploreWidget
	var exploreResults []*gogtrends.ExploreWidget
	const neededWidget = "fe_geo_chart_explore"
	// 25 minutes
	ttl := time.Second * 1500

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// first, see if it's time to invalidate/update the caches
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, worker HAS NOT processed data yet
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)

			// fetch widgets for exploring this query
			exploreResults, err = gogtrends.Explore(ctx, &gogtrends.ExploreRequest{
				ComparisonItems: []*gogtrends.ComparisonItem{
					{
						Keyword: keyword,
						Geo:     loc,
						Time:    timePeriod,
					},
				},
				Category: 0, // all programming categories?
				Property: "",
			}, lang)

			// PrintGogTrends(exploreResults)
			// LogGogTrendsError(err, "Error exploring google trends")

			if err != nil {
				return results, nil
			}

			// get the widget that we want
			for j := 0; j < len(exploreResults); j++ {
				curr := exploreResults[j]
				// and return it
				if curr.Type == neededWidget {
					log.Info("FOUND fe_geo_chart_explore")
					// PrintGogTrends(make([]*gogtrends.ExploreWidget, 1))
					results = curr
					break
				}
			}

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
			if err != nil {
				return results, err
			}
		}
	} else {
		// cache hit, worker HAS processed the data
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}

func (g GoogleTrend) getInterestByLocation(ctx context.Context, keyword, loc, timePeriod, lang string, widget *gogtrends.ExploreWidget) ([]*gogtrends.GeoMap, error) {
	var cacheKey = fmt.Sprintf("google-geomap:%s:%s:%s:%s", keyword, loc, timePeriod, lang)
	var results []*gogtrends.GeoMap
	var err error
	// 25 minutes
	ttl := time.Second * 1500

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// first, see if it's time to invalidate/update the caches
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, worker HAS NOT processed data yet
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)
			results, err = gogtrends.InterestByLocation(ctx, widget, lang)

			if err != nil {
				log.Error("Error fetching interests by location (geomap) for trend '", keyword, "' with error: ", err)
				return results, err
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
				err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
				if err != nil {
					return results, err
				}
			}
		}
	} else {
		// cache hit, worker HAS processed the data
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}
