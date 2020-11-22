// model.go
package models

import (
	"context"
	"encoding/json"
	"github.com/codihuston/gorilla-mux-http/database"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"io"
	"strings"
	"time"
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

func (g GoogleTrend) GetDailyTrends(result *[]GoogleTrend) error {
	var cacheKey = "daily-trends"

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			glog.Info("CACHE MISS:", cacheKey)
			// set nothing; worker will populate this memstore eventually...
			return nil
		}
	} else {

		dec := json.NewDecoder(strings.NewReader(val))

		for {
			if err := dec.Decode(&result); err == io.EOF {
				break
			} else if err != nil {
				glog.Error(err)
				panic(err)
			}
		}
	}

	return nil
}
