// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/groovili/gogtrends"
	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/public-api/database"
)

type GoogleTrend struct {
	Title            GoogleTrendQuery     `json:"title" bson:"title"`
	FormattedTraffic string               `json:"formattedTraffic" bson:"formattedTraffic"`
	RelatedQueries   []GoogleTrendQuery   `json:"relatedQueries" bson:"relatedQueries"`
	Image            GoogleTrendImage     `json:"image" bson:"image"`
	Articles         []GoogleTrendArticle `json:"articles" bson:"articles"`
	ShareURL         string               `json:"shareUrl" bson:"shareUrl"`
}

type GoogleTrendQuery struct {
	Query       string `json:"query" bson:"query"`
	ExploreLink string `json:"exploreLink" bson:"exploreLink"`
}

type GoogleTrendImage struct {
	NewsURL  string `json:"newsUrl" bson:"newsUrl"`
	Source   string `json:"source" bson:"source"`
	ImageURL string `json:"imageUrl" bson:"imageUrl"`
}

type GoogleTrendArticle struct {
	Title   string           `json:"title" bson:"title"`
	TimeAgo string           `json:"timeAgo" bson:"timeAgo"`
	Source  string           `json:"source" bson:"source"`
	Image   GoogleTrendImage `json:"image" bson:"image"`
	URL     string           `json:"url" bson:"url"`
	Snippet string           `json:"snippet" bson:"snippet"`
}

type StateTrend struct {
	Topic   string `json:"topic" bson:"topic"`
	Value   int    `json:"value" bson:"value"`
	GeoCode string `json:"geoCode" bson:"geo_code"`
}

type State struct {
	Name   string       `json:"name" bson:"name"`
	Trends []StateTrend `json:"trends" bson:"trends"`
}

func (g GoogleTrend) GetDailyTrends(result *[]GoogleTrend) error {
	var cacheKey = "daily-trends"

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)
			// set nothing; worker will populate this memstore eventually...
			return nil
		}
	} else {

		dec := json.NewDecoder(strings.NewReader(val))

		for {
			if err := dec.Decode(&result); err == io.EOF {
				break
			} else if err != nil {
				log.Error(err)
				panic(err)
			}
		}
	}

	return nil
}

func (g GoogleTrend) GetRealtimeTrends(hl, loc, cat string) ([]*gogtrends.TrendingStory, error) {
	var cacheKey = fmt.Sprintf("google-realtime-trends:%s:%s:%s", hl, loc, cat)
	var results []*gogtrends.TrendingStory

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)
			// set nothing; worker will populate this memstore eventually...
			return results, err
		}
	} else {

		dec := json.NewDecoder(strings.NewReader(val))

		for {
			if err := dec.Decode(&results); err == io.EOF {
				break
			} else if err != nil {
				log.Error(err)
				panic(err)
			}
		}
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
