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

			LogGogTrendsError(err, "Failed to get daily google trends")

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

func (g GoogleTrend) GetGeoWidgets(ctx context.Context, today string, dt []*gogtrends.TrendingSearch, ch chan<- []*gogtrends.ExploreWidget) {
	var exploreResults []*gogtrends.ExploreWidget
	var geoWidgets []*gogtrends.ExploreWidget
	var err error

	for i := 0; i < len(dt); i++ {
		// get the current trend
		trend := dt[i]

		// fetch widgets for exploring this topic
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

func (g GoogleTrend) GetGeoWidgetsOrig(ctx context.Context, today string, dt []*gogtrends.TrendingSearch) ([]*gogtrends.ExploreWidget, error) {
	var exploreResults []*gogtrends.ExploreWidget
	var geoWidgets []*gogtrends.ExploreWidget
	var err error

	for i := 0; i < len(dt); i++ {
		// get the current trend
		trend := dt[i]

		// fetch widgets for exploring this topic
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
	return geoWidgets, nil
}

func (g GoogleTrend) GetGeoMapsAsync(ctx context.Context, geoWidget *gogtrends.ExploreWidget, ch chan<- []*gogtrends.GeoMap, i int) {
	log.Infof("Start GetGeoMap %d", i)
	geoMap, err := gogtrends.InterestByLocation(ctx, geoWidget, langEn)
	log.Infof("End GetGeoMap %d", i)
	// TODO: determine how to handle errors...
	LogGogTrendsError(err, "Error getting region data for google trends")
	if err != nil {
		panic(err)
	}
	// geoMaps = append(geoMaps, geoMap)
	ch <- geoMap
}

func (g GoogleTrend) GetGeoMaps(ctx context.Context, geoWidgets []*gogtrends.ExploreWidget) [][]*gogtrends.GeoMap {
	ch := make(chan []*gogtrends.GeoMap)
	var geoMaps = make([][]*gogtrends.GeoMap, 0)

	for i := 0; i < len(geoWidgets); i++ {
		geoWidget := geoWidgets[i]
		// geoMap, err := gogtrends.InterestByLocation(ctx, geoWidget, langEn)
		go g.GetGeoMapsAsync(ctx, geoWidget, ch, i)
		// TODO: determine how to handle errors...
		// geoMaps = append(geoMaps, geoMap)
	}

	for i := 0; i < len(geoWidgets); i++ {
		geoMaps = append(geoMaps, <-ch)
	}

	return geoMaps
}

// GetDailyTrendsByState returns an array of ...
func (g GoogleTrend) GetDailyTrendsByState() (map[string][]StateTrend, error) {
	var dt []*gogtrends.TrendingSearch
	var geoWidgets []*gogtrends.ExploreWidget
	var geoMaps = make([][]*gogtrends.GeoMap, 0)
	var stateTrends = make(map[string][]StateTrend)

	start := time.Now()

	ctx := context.Background()
	// init channel of widget type
	ch1 := make(chan []*gogtrends.ExploreWidget)
	ch2 := make(chan []*gogtrends.GeoMap)
	dt, err := g.GetDailyTrends()

	LogGogTrendsError(err, "Error getting google trends")
	if err != nil {
		return stateTrends, err
	}

	// explore each trend (TODO: make concurrent...)
	// TODO: handle panic??
	log.Info("get geoWidgets:", ch1)
	// go g.GetGeoWidgets(ctx, "today 12-m", dt, ch1)
	// geoWidgets = <-ch
	geoWidgets, err = g.GetGeoWidgetsOrig(ctx, "today 12-m", dt)
	log.Info("done geoWidgets:")
	// log.Info("print geoWidgets:")
	// PrintGogTrends(geoWidgets)

	// get interest by location (TODO: make concurrent)
	// each trend has a []geoWidget
	log.Info("get geoMaps:", ch2)
	geoMaps = g.GetGeoMaps(ctx, geoWidgets)
	// for n := range ch2 {
	// 	geoMaps = append(geoMaps, n)
	// }
	log.Info("done geoMaps:")
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
	log.Info("process trends/geoMaps:")
	for i := 0; i < len(dt); i++ {
		// assuming there is exactly the same # of geoMaps as dts
		trend := dt[i]
		// IMPORTANT: if concurrency is introduced, dt[i] and geoMap[i] may not
		// match 1-to-1!!!
		geoMap := geoMaps[i]
		for j := 0; j < len(geoMap); j++ {
			location := geoMap[j]
			st := StateTrend{
				GeoCode: location.GeoCode,
				Topic:   trend.Title.Query,
				Value:   location.Value[0],
			}
			stateTrends[location.GeoName] = append(stateTrends[location.GeoName], st)
			// now sort that array of slices by .Value, asc
			sort.Slice(stateTrends[location.GeoName], func(i, j int) bool {
				return stateTrends[location.GeoName][i].Value > stateTrends[location.GeoName][j].Value
			})
		}
	}

	secs := time.Since(start).Seconds()
	log.Infof("DONE. %.4f elapsed", secs)
	// log.Info(stateTrends)

	return stateTrends, nil
}
