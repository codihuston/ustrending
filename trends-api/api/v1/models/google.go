// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"time"

	"github.com/codihuston/ustrending/trends-api/database"
	"github.com/go-redis/redis/v8"
	"github.com/groovili/gogtrends"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

const (
	locUS  = "US"
	catAll = "all"
	langEn = "EN"
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
		log.Fatal(errors.Wrap(err, errMsg))
	}
}

// PrintGogTrends will log a gogtrends struct
func PrintGogTrends(items interface{}) {
	ref := reflect.ValueOf(items)

	if ref.Kind() != reflect.Slice {
		log.Fatalf("Failed to print %s. It's not a slice type.", ref.Kind())
	}

	for i := 0; i < ref.Len(); i++ {
		//MarshalIndent
		empJSON, err := json.MarshalIndent(ref.Index(i).Interface(), "", "  ")
		if err != nil {
			log.Fatalf(err.Error())
		}
		fmt.Printf("%s\n", string(empJSON))
		// log.Println(ref.Index(i).Interface())
	}
}

// GetDailyTrends returns an array of gogtrends.TrendingSearch.
func (g GoogleTrend) GetDailyTrends() ([]*gogtrends.TrendingSearch, error) {
	var maxTrends = 10
	// TODO: rename me
	var cacheKey = "daily-trends"
	ctx := context.Background()

	// otherwise fetch from api
	var results []*gogtrends.TrendingSearch

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)

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
	var results []*gogtrends.TrendingStory
	// 15 minutes
	ttl := time.Second * 900

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			// otherwise fetch from google
			results, err = gogtrends.Realtime(ctx, hl, loc, cat)

			if err != nil {
				return results, err
			}

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
			if err != nil {
				return results, err
			}
			// end if key !exists
		} else {
			return results, err
		}
	} else {
		log.Info("CACHE HIT!")

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

func (g GoogleTrend) GetTrendInterest(keyword, loc, timePeriod, lang string) ([]*gogtrends.GeoMap, error) {
	var result []*gogtrends.GeoMap
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// TODO: cache me

	// get the geo widget from exploring this topic
	widget, err := g.getGeoWidget(ctx, keyword, loc, timePeriod, lang)

	if err != nil {
		return result, err
	}

	// now fetch the interests by location
	result, err = g.getInterestByLocation(ctx, widget, lang)

	if err != nil {
		return result, err
	}

	return result, nil
}

func (g GoogleTrend) getGeoWidget(ctx context.Context, keyword, loc, timePeriod, lang string) (*gogtrends.ExploreWidget, error) {
	var result *gogtrends.ExploreWidget
	var exploreResults []*gogtrends.ExploreWidget
	const neededWidget = "fe_geo_chart_explore"
	// TODO: cache me

	// fetch widgets for exploring this query
	exploreResults, err := gogtrends.Explore(ctx, &gogtrends.ExploreRequest{
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
		return result, nil
	}

	// get the widget that we want
	for j := 0; j < len(exploreResults); j++ {
		curr := exploreResults[j]
		// and return it
		if curr.Type == neededWidget {
			// log.Info("FOUND fe_geo_chart_explore")
			// PrintGogTrends(make([]*gogtrends.ExploreWidget, 1))
			result = curr
			break
		}
	}
	return result, nil
}

func (g GoogleTrend) getInterestByLocation(ctx context.Context, widget *gogtrends.ExploreWidget, lang string) ([]*gogtrends.GeoMap, error) {
	var result []*gogtrends.GeoMap

	// TODO: cache me
	result, err := gogtrends.InterestByLocation(ctx, widget, lang)

	//LogGogTrendsError(err, "Error getting region data for google trends")
	if err != nil {
		log.Fatal("Error fetching interests by location for trend '", widget.Request.CompItem[0].ComplexKeywordsRestriction.Keyword[0].Value, "' with error: ", err)
		return result, err
	}

	return result, nil
}
