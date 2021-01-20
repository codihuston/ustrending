// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/codihuston/ustrending/public-api/database"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
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

// GetPlaces returns an array of all places, or countries for a given country (includes worldwide entry)
func (p *Place) GetPlaces(countryCode string) ([]Place, error) {
	var cacheKey = "places"
	var filter bson.M
	results := []Place{}
	ttl := time.Hour * 12
	worldwideWoeid := 1

	if len(countryCode) <= 0 {
		cacheKey += ":all"
		// includes all places
		filter = bson.M{}
	} else {
		cacheKey += ":" + countryCode
		filter = bson.M{
			"$or": []bson.M{
				bson.M{ // this country
					"countryCode": countryCode,
				},
				bson.M{ // include global
					"woeid": worldwideWoeid,
				},
			}}
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

// GetNearestPlaceByPoint returns up to 5 locations nearest to a given point
func (p *Place) GetNearestPlaceByPoint(long, lat float64, limit int64) ([]*Place, error) {
	var cacheKey = fmt.Sprintf("place:%f,%f:%d", long, lat, limit)
	var results []*Place
	ttl := time.Hour * 3
	var maxLimit int64 = 5

	// validate limit
	if limit > maxLimit {
		limit = 5
	} else if limit <= 0 {
		limit = 1
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	findOptions := options.Find()
	findOptions.SetLimit(limit)

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(collectionName)

			cur, err := collection.Find(ctx, bson.M{
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
			}, findOptions)

			if err == database.ErrNoDocuments {
				return results, nil
			} else if err != nil {
				return results, err
			}

			// parse data into results
			for cur.Next(ctx) {
				// create a value into which the single document can be decoded
				var elem Place
				err := cur.Decode(&elem)
				if err != nil {
					log.Fatal(err)
				}

				results = append(results, &elem)
			}

			// cache it
			response, _ := json.Marshal(results)
			err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
			if err != nil {
				panic(err)
			}
			// end if key !exists
		} else {
			panic(err)
		}
	} else {
		log.Info("CACHE HIT!", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &results)
	}

	return results, nil
}
