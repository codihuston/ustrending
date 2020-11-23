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
	"sort"
	"time"
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
	var cacheKey = "daily-trends-go"
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

// GetDailyTrendsByState returns an array of ...
func (g GoogleTrend) GetDailyTrendsByState() (map[string][]StateTrend, error) {
	// ensures outgoing requests go out only once in a specific time window
	var cacheKey = "daily-trends-by-state-go-proxy"
	var stateTrends = make(map[string][]StateTrend)
	// how long the cache proxy should live for (in minutes)
	const cacheProxyLifetime = 29

	ctx := context.Background()

	/*
		TODO: implement 2 cache keys, 1 for perpetual cache, and another for
		"updating" that cache, so that we don't have to lose the previous iteration,
		and we can reduce outgoing requests during development

		- check a "proxy key" "to-update-daily-trends" (should eventually expire)
		- if there is no cache for "daily-trends"
			- query the google api
			- cache it
		- if there is, and "proxy key" it is expired, update the cache
			- query the google api
		- otherwise, "proxy key" is NOT expired, READ from the cache
			- this will reduce outgoing requests in development or when
			the worker eventually runs this code (even after a reboot)
	*/

	// first, see if it's time to invalidate/update the caches
	_, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		// cache miss, proxy key is unset
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey, "will update cache...")

			// rehydrate the cache
			stateTrends, err = g.getDailyTrendsByStateHelper(ctx, true)
			if err != nil {
				panic(err)
			}

			// set the proxy key
			err = database.CacheClient.Set(ctx, cacheKey, "", time.Minute*cacheProxyLifetime).Err()
			if err != nil {
				panic(err)
			}
		}
	} else {
		// cache hit, proxy key is set, read the end-result from cache
		log.Info("CACHE HIT: ", cacheKey, "attempting to return from cache (will use preserved caches, if any)...")
		stateTrends, err = g.getDailyTrendsByStateHelper(ctx, false)
	}
	return stateTrends, nil
}

func (g GoogleTrend) getDailyTrendsByStateHelper(ctx context.Context, shouldUpdateCache bool) (map[string][]StateTrend, error) {
	var dt []*gogtrends.TrendingSearch
	var geoWidgets []*gogtrends.ExploreWidget
	var geoMaps = make(map[string][][]*gogtrends.GeoMap, 0)
	var stateTrends = make(map[string][]StateTrend)

	start := time.Now()

	// first, get daily trends
	dt, err := g.GetDailyTrends()

	LogGogTrendsError(err, "Error getting google trends")
	if err != nil {
		return stateTrends, err
	}

	// explore each trend (TODO: this is concurrent, handle panics)
	log.Info("Start fetching geoWidgets")
	geoWidgets, err = g.getGeoWidgets(ctx, shouldUpdateCache, "today 12-m", &dt)
	log.Info("DONE fetching geoWidgets.")
	// log.Info("print geoWidgets:")
	// PrintGogTrends(geoWidgets)

	// get interest by location (TODO: this is concurrent, handle panics)
	log.Info("Start fetching geoMaps")
	geoMaps = g.getGeoMaps(ctx, geoWidgets)
	log.Info("DONE fetching geoMaps.")
	// log.Info("print geoMap:")
	// PrintGogTrends(geoMaps)

	log.Info("Start processing all trends/geoMaps:")
	stateTrends = g.getProcessedStateTrends(ctx, shouldUpdateCache, &dt, &geoMaps)

	secs := time.Since(start).Seconds()

	log.Infof("DONE. %.4f elapsed", secs)
	// log.Info(stateTrends)
	// TODO: cache this end result
	return stateTrends, nil
}

// getGeoWidgets fetches a list of GeoWidgets (of type ExploreWidget) from
// the google api concurrently.
func (g GoogleTrend) getGeoWidgets(ctx context.Context, shouldUpdateCache bool, today string, dt *[]*gogtrends.TrendingSearch) ([]*gogtrends.ExploreWidget, error) {
	var cacheKey = "daily-trends-by-state-geowidgets-go"
	//var results = make([]*gogtrends.ExploreWidget, len(*dt))
	var results []*gogtrends.ExploreWidget

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil || shouldUpdateCache {
		if err == redis.Nil || shouldUpdateCache {
			if shouldUpdateCache {
				log.Info("SHOULD UPDATE CACHE: ", cacheKey)
			} else {
				log.Info("CACHE MISS: ", cacheKey)
			}

			results = g.fetchGeoWidgets(ctx, today, dt)

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
			if err != nil {
				panic(err)
			}
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

func (g GoogleTrend) fetchGeoWidgets(ctx context.Context, today string, dt *[]*gogtrends.TrendingSearch) []*gogtrends.ExploreWidget {
	var results []*gogtrends.ExploreWidget
	var err error

	ch := make(chan *gogtrends.ExploreWidget, len(*dt))

	for i := 0; i < len(*dt); i++ {
		// get the current trend
		trend := (*dt)[i]

		go g.getGeoWidgetsConcurrent(ctx, today, trend.Title.Query, ch)

		// TODO: determine how to handle errors...
		LogGogTrendsError(err, "Error exploring google trends")
		if err != nil {
			panic(err)
		}
	}

	for i := 0; i < len(*dt); i++ {
		// map geoMaps[topic name] => GeoMap
		geoWidget := <-ch
		results = append(results, geoWidget)
	}
	close(ch)
	return results
}

// getGeoWidgetsConcurrent actually queries the google trends api.
// returns a single ExploreWidget thru a channel.
func (g GoogleTrend) getGeoWidgetsConcurrent(ctx context.Context, today string, query string, ch chan<- *gogtrends.ExploreWidget) {
	var exploreResults []*gogtrends.ExploreWidget
	const neededWidget = "fe_geo_chart_explore"

	// fetch widgets for exploring this query
	exploreResults, err := gogtrends.Explore(ctx, &gogtrends.ExploreRequest{
		ComparisonItems: []*gogtrends.ComparisonItem{
			{
				Keyword: query,
				Geo:     locUS,
				Time:    today,
			},
		},
		Category: 0, // all programming categories?
		Property: "",
	}, langEn)

	// PrintGogTrends(exploreResults)

	// TODO: determine how to handle errors...
	LogGogTrendsError(err, "Error exploring google trends")
	if err != nil {
		panic(err)
	}

	// get the widget that we want
	for j := 0; j < len(exploreResults); j++ {
		curr := exploreResults[j]
		// and return it
		if curr.Type == neededWidget {
			// log.Info("FOUND fe_geo_chart_explore")
			// PrintGogTrends(make([]*gogtrends.ExploreWidget, 1))
			ch <- curr
			break
		}
	}
}

// getGeoMaps gets a list of GeoMaps for a given trend.
// Each has a []ExploreWidget of type "fe_geo_chart_explore".
// This method will get its geoMap (interest by region) using said widget.
func (g GoogleTrend) getGeoMaps(ctx context.Context, geoWidgets []*gogtrends.ExploreWidget) map[string][][]*gogtrends.GeoMap {
	ch := make(chan GeoMapResponse)
	var geoMaps = make(map[string][][]*gogtrends.GeoMap, 0)

	for i := 0; i < len(geoWidgets); i++ {
		geoWidget := geoWidgets[i]
		// TODO: determine how to handle errors...
		go g.getGeoMapsConcurrent(ctx, geoWidget, ch, i)
	}

	for i := 0; i < len(geoWidgets); i++ {
		// map geoMaps[topic name] => GeoMap
		res := <-ch
		geoMaps[res.Topic] = append(geoMaps[res.Topic], res.GeoMap)
	}

	return geoMaps
}

// getGeoMapsConcurrent will query the google api concurrently,
// returning a GeoMap through a channel.
func (g GoogleTrend) getGeoMapsConcurrent(ctx context.Context, geoWidget *gogtrends.ExploreWidget, ch chan<- GeoMapResponse, i int) {
	// get the interests of this topic by location (from a given geoWidget)
	log.Infof("Start GetGeoMap %d", i)
	geoMap, err := gogtrends.InterestByLocation(ctx, geoWidget, langEn)
	log.Infof("End GetGeoMap %d", i)

	// TODO: determine how to handle errors...
	LogGogTrendsError(err, "Error getting region data for google trends")
	if err != nil {
		panic(err)
	}
	// geoMaps = append(geoMaps, geoMap)
	res := GeoMapResponse{
		// TODO: add error checking here?
		Topic:  geoWidget.Request.CompItem[0].ComplexKeywordsRestriction.Keyword[0].Value,
		GeoMap: geoMap,
	}
	ch <- res
}

// processStateTrends processes daily trends and their corresponding geo maps
// Into []StateTrend, which is the final result returned from this api.
func (g GoogleTrend) getProcessedStateTrends(ctx context.Context, shouldUpdateCache bool, dt *[]*gogtrends.TrendingSearch, geoMaps *map[string][][]*gogtrends.GeoMap) map[string][]StateTrend {
	var cacheKey = "daily-trends-by-state-go"
	var results = make(map[string][]StateTrend)

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil || shouldUpdateCache {
		if err == redis.Nil || shouldUpdateCache {
			if shouldUpdateCache {
				log.Info("SHOULD UPDATE CACHE: ", cacheKey)
			} else {
				log.Info("CACHE MISS: ", cacheKey)
			}

			g.processStateTrends(&results, dt, geoMaps)

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
			if err != nil {
				panic(err)
			}
		} else {
			panic(err)
		}
	} else {
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results
}

func (g GoogleTrend) processStateTrends(results *map[string][]StateTrend, dt *[]*gogtrends.TrendingSearch, geoMaps *map[string][][]*gogtrends.GeoMap) {
	// safely iterate over the smallest list (they should be same length)
	for i := 0; i < min(len(*dt), len(*geoMaps)); i++ {
		// assuming there is exactly the same # of geoMaps as dts
		trend := (*dt)[i]
		// geo maps are mapped to the trend query, each trend should have a map
		val, ok := (*geoMaps)[trend.Title.Query]
		var geoMap []*gogtrends.GeoMap

		// confirm that there exists a geomap
		if !ok {
			log.Warnf("A geomap does not exist for query: %s", trend.Title.Query)
			continue
		}

		// if there is a geomap, use it
		if len(val) > 0 {
			geoMap = val[0]
		} else {
			log.Warnf("A geomap exists for query: %s, but does not have a length (len=%d)", trend.Title.Query, len(geoMap))
			PrintGogTrends(val)
			continue
		}

		log.Infof("Processing geomap for '%s' (len=%d)", trend.Title.Query, len(geoMap))

		// map the geo map for each topic into a list
		for j := 0; j < len(geoMap); j++ {
			// get geo data
			location := *geoMap[j]
			// build output object
			st := StateTrend{
				GeoCode: location.GeoCode,
				Topic:   trend.Title.Query,
				Value:   location.Value[0],
			}
			// add output object to this state
			(*results)[location.GeoName] = append((*results)[location.GeoName], st)
			// sorted by value (rank), ascending
			sort.Slice((*results)[location.GeoName], func(i, j int) bool {
				return (*results)[location.GeoName][i].Value > (*results)[location.GeoName][j].Value
			})
		}
	} // end for
}
