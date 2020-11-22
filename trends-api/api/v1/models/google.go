// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/codihuston/gorilla-mux-http/database"
	"github.com/go-redis/redis/v8"
	"github.com/groovili/gogtrends"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
	"reflect"
)

const (
	locUS  = "US"
	catAll = "all"
	langEn = "EN"
)

type GoogleTrend struct{}

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

// GetDailyTrends returns an array of gogtrends.TrendingSearch
func (g GoogleTrend) GetDailyTrends() ([]*gogtrends.TrendingSearch, error) {
	// TODO: rename me
	var cacheKey = "daily-trends-go"
	ctx := context.Background()

	// otherwise fetch from api
	var results []*gogtrends.TrendingSearch

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			results, err := gogtrends.Daily(ctx, langEn, locUS)

			LogGogTrendsError(err, "Failed to get daily searches")

			if err != nil {
				return results, err
			}

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
		log.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results, nil
}
