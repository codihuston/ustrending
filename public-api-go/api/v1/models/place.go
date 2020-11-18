// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/codihuston/gorilla-mux-http/database"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

var collectionName = "places"

// type PlaceFields struct {
// 	City      string `json:"city" bson:"city"`
// 	Zip       int    `json:"zip" bson:"zip"`
// 	Dst       int    `json:"dst" bson:"dst"`
// 	Longitude uint   `json:"longitude" bson:"longitude"`
// 	Latitude  uint   `json:"latitude" bson:"latitude"`
// }

// type Place struct {
// 	ID     primitive.ObjectID `json:"_id" bson:"_id"`
// 	Fields struct {
// 		City      string `json:"city" bson:"city"`
// 		Zip       int    `json:"zip" bson:"zip"`
// 		Dst       int    `json:"dst" bson:"dst"`
// 		Longitude uint   `json:"longitude" bson:"longitude"`
// 		Latitude  uint   `json:"latitude" bson:"latitude"`
// 	} `json:"fields" bson:"fields"`
// }

type Place struct {
	ID          primitive.ObjectID `json:"_id" bson:"_id"`
	Country     string             `json:"country" bson:"country"`
	CountryCode string             `json:"countryCode" bson:"countryCode"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	Geo         struct {
		Type        string    `json:"type" bson:"type"`
		Coordinates []float64 `json:"coordinates" bson:"coordinates"`
	} `json:"geo" bson:"geo"`
	Name      string `json:"name" bson:"name"`
	ParentID  int    `json:"parentId" bson:"parentId"`
	PlaceType struct {
		Code int    `json:"code" bson:"code"`
		Name string `json:"name" bson:"name"`
	} `json:"placeType" bson:"placeType"`
	Region     string    `json:"region" bson:"region"`
	TimezoneID string    `json:"timezoneId" bson:"timezone_id"`
	UpdatedAt  time.Time `json:"updatedAt" bson:"updatedAt"`
	URL        string    `json:"url" bson:"url"`
	Woeid      int       `json:"woeid" bson:"woeid"`
}

func GetPlaces() ([]Place, error) {
	var cacheKey = "places"
	results := []Place{}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			glog.Info("key does not exists")

			// otherwise fetch from database
			collection := database.DB.Collection(collectionName)
			cur, err := collection.Find(ctx, bson.D{})
			if err != nil {
				return nil, err
			}
			defer cur.Close(ctx)

			for cur.Next(ctx) {
				// var result bson.M
				var result = Place{}
				err := cur.Decode(&result)
				if err != nil {
					glog.Fatal(err)
				}
				// do something with result....
				results = append(results, result)
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
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
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}

func GetNearestPlaceByPoint(long, lat float64) (Place, error) {
	var cacheKey = fmt.Sprintf("place:%f,%f", long, lat)
	var result = Place{}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			glog.Info("No cache for:", cacheKey)

			// otherwise fetch from database
			collection := database.DB.Collection(collectionName)
			err := collection.FindOne(ctx, bson.M{
				"geo": bson.M{
					"$near": bson.M{
						"$geometry": bson.M{
							"type":        "Point",
							"coordinates": bson.A{long, lat},
						},
					},
				},
				"placeType": bson.M{
					"code": 7,
					"name": "Town",
				},
			}).Decode(&result)

			if err != nil {
				return result, err
			}

			// cache it
			response, _ := json.Marshal(result)
			err = database.CacheClient.Set(ctx, cacheKey, response, 0).Err()
			if err != nil {
				panic(err)
			}
			// end if key !exists
		} else {
			panic(err)
		}
	} else {
		glog.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &result)
	}

	return result, nil
}
