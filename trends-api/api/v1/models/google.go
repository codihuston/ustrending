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

// GetDailyTrends returns an array of gogtrends.TrendingSearch
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
			log.Info("CACHE MISS:", cacheKey)

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
		log.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}
	return results, nil
}

func (g GoogleTrend) GetGeoWidgets(ctx context.Context, today string, dt []*gogtrends.TrendingSearch, ch chan<- []*gogtrends.ExploreWidget) {
	var exploreResults []*gogtrends.ExploreWidget
	var geoWidgets []*gogtrends.ExploreWidget
	var err error

	for i := 0; i < len(dt); i++ {
		// get the current trend
		trend := dt[i]

		// fetch widgets for exploring this query
		exploreResults, err = gogtrends.Explore(ctx, &gogtrends.ExploreRequest{
			ComparisonItems: []*gogtrends.ComparisonItem{
				{
					Keyword: trend.Title.Query,
					Geo:     locUS,
					Time:    today,
				},
			},
			Category: 0, // all programming categories?
			Property: "",
		}, langEn)

		// PrintGogTrends(exploreResults)

		// get the widget that we want?
		// neededWidget = "fe_geo_chart_explore"
		for j := 0; j < len(exploreResults); j++ {
			curr := exploreResults[j]
			if curr.Type == "fe_geo_chart_explore" {
				// log.Info("FOUND fe_geo_chart_explore")
				// PrintGogTrends(make([]*gogtrends.ExploreWidget, 1))
				geoWidgets = append(geoWidgets, curr)
				break
			}
		}

		// TODO: determine how to handle errors...
		LogGogTrendsError(err, "Error exploring google trends")
		if err != nil {
			panic(err)
		}
	}
	ch <- geoWidgets
	close(ch)
	// return geoWidgets, nil
}

func (g GoogleTrend) getGeoWidgetsOrig(ctx context.Context, today string, dt []*gogtrends.TrendingSearch) ([]*gogtrends.ExploreWidget, error) {
	var exploreResults []*gogtrends.ExploreWidget
	var geoWidgets []*gogtrends.ExploreWidget
	var err error
	var neededWidget = "fe_geo_chart_explore"

	// this should return as many GeoWidgets as there are daily trends
	for i := 0; i < len(dt); i++ {
		log.Infof("@ i:%d len:%d", i, len(dt))

		// get the current trend
		curr := dt[i]
		// we will "compare" only this trend to get it's true ranking by region
		// previously I would chunk outgoing requests in pairs of 5, but this
		// would result in trends being ranked relative to one another, and not
		// just based on its overall ranking in the state
		cmp := make([]*gogtrends.ComparisonItem, 0, 1)
		// create comparison record
		new := &gogtrends.ComparisonItem{
			Keyword: curr.Title.Query,
			Geo:     locUS,
			Time:    today,
		}
		// push onto what will be "compared"
		cmp = append(cmp, new)

		// fetch widgets for exploring this query (cmp item)
		exploreResults, err = gogtrends.Explore(ctx, &gogtrends.ExploreRequest{
			ComparisonItems: cmp,
			Category:        0, // all categories
			Property:        "",
		}, langEn)

		// PrintGogTrends(exploreResults)

		// parse response for the widget we need
		for j := 0; j < len(exploreResults); j++ {
			curr := exploreResults[j]
			// do not need to consider the following note from the gogtrends api
			// b/c I am filtering on a specific type:
			// "Please notice, when you call Explore method for keywords comparison,
			// two first widgets would be for all of compared items, next widgets
			// would be for each of individual items."
			if curr.Type == neededWidget {
				log.Infof("FOUND %s trend #:%d, widget index:%d %v+", neededWidget, i, j, curr)
				// PrintGogTrends(make([]*gogtrends.ExploreWidget{curr}, 1))
				geoWidgets = append(geoWidgets, curr)
			}
		}

		// TODO: determine how to handle errors...
		LogGogTrendsError(err, "Error exploring google trends")
		if err != nil {
			panic(err)
		}

		// PrintGogTrends(geoWidgets)
	} // end for each trend
	return geoWidgets, nil
}

type GeoMapResponse struct {
	Topic  string
	GeoMap []*gogtrends.GeoMap
}

func (g GoogleTrend) getGeoMapsAsync(ctx context.Context, geoWidget *gogtrends.ExploreWidget, ch chan<- GeoMapResponse, i int) {
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

func (g GoogleTrend) getGeoMaps(ctx context.Context, geoWidgets []*gogtrends.ExploreWidget) map[string][][]*gogtrends.GeoMap {
	ch := make(chan GeoMapResponse)
	var geoMaps = make(map[string][][]*gogtrends.GeoMap, 0)

	for i := 0; i < len(geoWidgets); i++ {
		geoWidget := geoWidgets[i]
		// geoMap, err := gogtrends.InterestByLocation(ctx, geoWidget, langEn)
		// geoMaps = append(geoMaps, geoMap)
		// TODO: determine how to handle errors...
		go g.getGeoMapsAsync(ctx, geoWidget, ch, i)
	}

	for i := 0; i < len(geoWidgets); i++ {
		// map geoMaps[topic name] => GeoMap
		res := <-ch
		geoMaps[res.Topic] = append(geoMaps[res.Topic], res.GeoMap)
	}

	return geoMaps
}

// GetDailyTrendsByState returns an array of ...
func (g GoogleTrend) GetDailyTrendsByState() (map[string][]StateTrend, error) {
	var cacheKey = "daily-trends-by-state-go"
	var dt []*gogtrends.TrendingSearch
	var geoWidgets []*gogtrends.ExploreWidget
	var geoMaps = make(map[string][][]*gogtrends.GeoMap, 0)
	var stateTrends = make(map[string][]StateTrend)

	start := time.Now()
	ctx := context.Background()

	// first, get dailyl trends
	dt, err := g.GetDailyTrends()

	LogGogTrendsError(err, "Error getting google trends")
	if err != nil {
		return stateTrends, err
	}

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

	// explore each trend (no need to be concurrent, this is far fewer requests
	// now than it was... but it may be worth it for the practice)
	// TODO: handle panic??
	log.Info("Start fetching geoWidgets")
	// go g.GetGeoWidgets(ctx, "today 12-m", dt, ch1)
	// geoWidgets = <-ch
	geoWidgets, err = g.getGeoWidgetsOrig(ctx, "today 12-m", dt)
	log.Info("DONE fetching geoWidgets.")
	// log.Info("print geoWidgets:")
	// PrintGogTrends(geoWidgets)

	// get interest by location (TODO: this is concurrent, handle panics)
	// using a trend's has a []geoWidget, get its geoMap (interest by region)
	log.Info("Start fetching geoMaps")
	geoMaps = g.getGeoMaps(ctx, geoWidgets)
	log.Info("DONE fetching geoMaps.")
	// log.Info("print geoMap:")
	// PrintGogTrends(geoMaps)

	/*
		now process this into:
		stateFullName => [
			{
				topic: "Kelly Loffler"
				value: 100
				geoCode: "US-GA"
			},
			...
		]
	*/
	log.Info("Start processing all trends/geoMaps:")
	// safely iterate over the smallest list (they should be same length)
	for i := 0; i < min(len(dt), len(geoMaps)); i++ {
		// assuming there is exactly the same # of geoMaps as dts
		trend := dt[i]
		// geo maps are mapped to the trend query, each trend should have a map
		val, ok := geoMaps[trend.Title.Query]
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
			location := geoMap[j]
			// build output object
			st := StateTrend{
				GeoCode: location.GeoCode,
				Topic:   trend.Title.Query,
				Value:   location.Value[0],
			}
			// add output object to this state
			stateTrends[location.GeoName] = append(stateTrends[location.GeoName], st)
			// sorted by value (rank), ascending
			sort.Slice(stateTrends[location.GeoName], func(i, j int) bool {
				return stateTrends[location.GeoName][i].Value > stateTrends[location.GeoName][j].Value
			})
		}
	}

	secs := time.Since(start).Seconds()
	log.Infof("DONE. %.4f elapsed", secs)
	// log.Info(stateTrends)

	// TODO: check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			// cache miss
			log.Info("CACHE MISS!")

			// cache it
			response, _ := json.Marshal(stateTrends)
			err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
			if err != nil {
				panic(err)
			}
		}
	} else {
		// TODO: read from cache
		log.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &stateTrends)
	}
	// TODO: cache this end result
	return stateTrends, nil
}
