// model.go
package models

import (
	"context"
	"encoding/json"
	"github.com/codihuston/gorilla-mux-http/database"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Location struct {
	ID            primitive.ObjectID `json:"_id" bson:"_id"`
	CensusPlaceID int                `json:"censusPlaceId" bson:"censusPlaceId"`
	CensusStateID int                `json:"censusStateId" bson:"censusStateId"`
	City          string             `json:"city" bson:"city"`
	Coordinates   struct {
		Type        string    `json:"type" bson:"type"`
		Coordinates []float64 `json:"coordinates" bson:"coordinates"`
	} `json:"coordinates" bson:"coordinates"`
	Country        string    `json:"country" bson:"country"`
	CreatedAt      time.Time `json:"createdAt" bson:"createdAt"`
	Population     int       `json:"population" bson:"population"`
	Region         string    `json:"region" bson:"region"`
	RegionFullName string    `json:"regionFullName" bson:"regionFullName"`
	TimezoneID     string    `json:"timezone_id" bson:"timezone_id"`
	UpdatedAt      time.Time `json:"updatedAt" bson:"updatedAt"`
	Woeid          int       `json:"woeid" bson:"woeid"`
	YahooURI       string    `json:"yahooUri" bson:"yahooUri"`
}

func GetLocations(start, count int) ([]Location, error) {
	var cacheKey = "locations"
	locations := []Location{}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			glog.Info("key does not exists")

			// otherwise fetch from database
			collection := database.DB.Collection("locations")
			cur, err := collection.Find(ctx, bson.D{})
			if err != nil {
				return nil, err
			}
			defer cur.Close(ctx)

			for cur.Next(ctx) {
				// var result bson.M
				var result = Location{}
				err := cur.Decode(&result)
				if err != nil {
					glog.Fatal(err)
				}
				// do something with result....
				locations = append(locations, result)
			}

			// cache it
			if len(locations) > 0 {
				response, _ := json.Marshal(locations)
				err := database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
				if err != nil {
					panic(err)
				}
			}
			// end if key !exists
		} else {
			panic(err)
		}
	} else {
		glog.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &locations)
	}

	return locations, nil
}
