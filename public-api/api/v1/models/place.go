// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/codihuston/ustrending/public-api/database"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

var collectionName = "places"

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

func (p Place) IsEmpty() bool {
	return p.ID == primitive.NilObjectID
}

func (p *Place) GetPlaces() error {
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
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(collectionName)
			cur, err := collection.Find(ctx, bson.D{})

			if err == database.ErrNoDocuments {
				return nil
			} else if err != nil {
				return err
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

	return nil
}

func (p *Place) GetNearestPlaceByPoint(long, lat float64) error {
	var cacheKey = fmt.Sprintf("place:%f,%f", long, lat)
	var result = p

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {

			glog.Info("CACHE MISS:", cacheKey)

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(collectionName)

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

			if err == database.ErrNoDocuments {
				return nil
			} else if err != nil {
				return err
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

	return nil
}
