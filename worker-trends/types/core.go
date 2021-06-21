package types

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

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

type StateTrend struct {
	Topic   string `json:"topic" bson:"topic"`
	Value   int    `json:"value" bson:"value"`
	GeoCode string `json:"geoCode" bson:"geo_code"`
}

type State struct {
	Name   string       `json:"name" bson:"name"`
	Trends []StateTrend `json:"trends" bson:"trends"`
}
