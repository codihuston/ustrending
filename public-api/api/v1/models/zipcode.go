// model.go
package models

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/codihuston/ustrending/public-api/database"
	"github.com/codihuston/ustrending/public-api/types"
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
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

func (z ZipCode) IsEmpty() bool {
	return z.ID == primitive.NilObjectID
}

func (z *ZipCode) GetPlaceByZipCode(zipcode string) error {
	var cacheKey = fmt.Sprintf("zipcode:%s", zipcode)
	var result = z

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// check cache
	val, err := database.CacheClient.Get(ctx, cacheKey).Result()
	if err != nil {
		if err == redis.Nil {
			log.Info("CACHE MISS:", cacheKey)

			// otherwise fetch from database
			dbClient := database.GetDatabaseConnection()
			collection := dbClient.Collection("zipcodes")
			err := collection.FindOne(ctx, bson.M{
				"fields.zip": zipcode,
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
		log.Info("CACHE HIT!")

		// convert json to list of structs
		json.Unmarshal([]byte(val), &result)
	}

	return nil
}
