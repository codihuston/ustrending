package models

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"time"

	thirdparty "github.com/codihuston/ustrending/trends-api/api/v1/third-party"
	"github.com/codihuston/ustrending/trends-api/database"
)

type Twitter struct{}

// GetTrendsByPlace fetches, caches, returns trends for a given place from the Twitter API
func (p Twitter) GetTrendsByPlace(woeid int64) ([]twitter.TrendsList, error) {
	// 14:59 min:seconds; if the worker stops
	ttl := time.Second * 899
	var cacheKey = fmt.Sprintf("twitter-trends:%d", woeid)
	var result []twitter.TrendsList

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			// otherwise fetch from twitter
			placeParams := &twitter.TrendsPlaceParams{WOEID: woeid, Exclude: ""}
			client := thirdparty.GetTwitterClient()
			trends, _, err := client.Trends.Place(woeid, placeParams)
			result = trends

			// cache it
			response, _ := json.Marshal(result)
			err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
			if err != nil {
				return nil, err
			}
			// end if key !exists
		} else {
			return nil, err
		}
	} else {
		log.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &result)
	}

	return result, nil
}
