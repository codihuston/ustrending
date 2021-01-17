// model.go
package models

import (
	"context"
	"encoding/json"
	"time"

	"github.com/codihuston/ustrending/trends-api/database"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (p *Place) GetPlaces(countryCode string) ([]Place, error) {
	var cacheKey = "places"
	var filter bson.M
	results := []Place{}
	ttl := time.Hour * 12

	if len(countryCode) <= 0 {
		cacheKey += ":all"
		filter = bson.M{}
	} else {
		cacheKey += ":" + countryCode
		filter = bson.M{
			"countryCode": countryCode,
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("key does not exists")

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(collectionName)
			cur, err := collection.Find(ctx, filter)

			if err == database.ErrNoDocuments {
				return nil, nil
			} else if err != nil {
				return nil, err
			}

			defer cur.Close(ctx)

			for cur.Next(ctx) {
				// var result bson.M
				var result = Place{}
				err := cur.Decode(&result)
				if err != nil {
					log.Fatal(err)
				}
				// do something with result....
				results = append(results, result)
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
				err := database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
				if err != nil {
					panic(err)
				}
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
