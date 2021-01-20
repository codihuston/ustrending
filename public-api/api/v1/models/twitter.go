// model.go
package models

import (
	"context"
	"encoding/json"
	"time"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/public-api/database"
)

type TwitterTrend struct{}

func (p TwitterTrend) GetRealtimeTrends() (map[int][]twitter.TrendsList, error) {
	var cacheKey = "twitter-trends-by-place"
	results := make(map[int][]twitter.TrendsList)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()

	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey, " try again later!")

			return results, nil
			// end if key !exists
		} else {
			return results, err
		}
	} else {
		// cache is populated already, no need to re-populate
		log.Info("CACHE HIT: skipping operation...")
		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}
