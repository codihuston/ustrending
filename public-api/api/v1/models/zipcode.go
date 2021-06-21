// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/codihuston/ustrending/public-api/database"
	"github.com/codihuston/ustrending/public-api/types"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ZipCodeFields struct {
	City     string `json:"city" bson:"city"`
	Zip      string `json:"zip" bson:"zip"`
	Dst      int    `json:"dst" bson:"dst"`
	State    string `json:"state" bson:"state"`
	Timezone int    `json:"timezone" bson:"timezone"`
}

type ZipCode struct {
	ID       primitive.ObjectID `json:"_id" bson:"_id"`
	Fields   ZipCodeFields
	Geometry types.GeometryPoint `json:"geometry" bson:"geometry"`
}

func (z ZipCode) GetCollectionName() string {
	return "zipcodes"
}

func (z ZipCode) IsEmpty() bool {
	return z.ID == primitive.NilObjectID
}

func (z *ZipCode) GetZipCode(zipcode string) (*ZipCode, error) {
	var cacheKey = fmt.Sprintf("zipcode:%s", zipcode)
	var result *ZipCode

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS: ", cacheKey)

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(z.GetCollectionName())
			err := collection.FindOne(ctx, bson.M{
				"fields.zip": zipcode,
			}).Decode(&result)

			if err == database.ErrNoDocuments {
				return nil, nil
			} else if err != nil {
				return nil, err
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
		log.Info("CACHE HIT: ", cacheKey)

		// convert json to list of structs
		json.Unmarshal([]byte(val), &result)
	}

	return result, nil
}

// GetNearestPlaceByPoint returns up to 5 locations nearest to a given point
func (z *ZipCode) GetNearestZipcodeByPoint(long, lat float64, limit int64) ([]*ZipCode, error) {
	var cacheKey = fmt.Sprintf("zipcode:%f,%f:%d", long, lat, limit)
	var results []*ZipCode
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
			log.Info("CACHE MISS: ", cacheKey)

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection(z.GetCollectionName())

			cur, err := collection.Find(ctx, bson.M{
				"geometry": bson.M{
					"$near": bson.M{
						"$geometry": bson.M{
							"type":        "Point",
							"coordinates": bson.A{long, lat},
						},
					},
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
				var elem ZipCode
				err := cur.Decode(&elem)
				if err != nil {
					log.Fatal(err)
				}

				results = append(results, &elem)
			}

			// cache it
			if len(results) > 0 {
				response, _ := json.Marshal(results)
				err = database.CacheClient.Set(ctx, cacheKey, response, ttl).Err()
				if err != nil {
					panic(err)
				}
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
