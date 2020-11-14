// model.go
package models

import (
	"context"
	"github.com/codihuston/gorilla-mux-http/database"
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

// func (p *Product) GetProduct() error {
// 	return db.Connection.QueryRow("SELECT name, price FROM products WHERE id=$1",
// 		p.ID).Scan(&p.Name, &p.Price)
// }

// func (p *Product) UpdateProduct() error {
// 	_, err :=
// 		db.Connection.Exec("UPDATE products SET name=$1, price=$2 WHERE id=$3",
// 			p.Name, p.Price, p.ID)

// 	return err
// }

// func (p *Product) DeleteProduct() error {
// 	_, err := db.Connection.Exec("DELETE FROM products WHERE id=$1", p.ID)

// 	return err
// }

// func (p *Product) CreateProduct() error {
// 	err := db.Connection.QueryRow(
// 		"INSERT INTO products(name, price) VALUES($1, $2) RETURNING id",
// 		p.Name, p.Price).Scan(&p.ID)

// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

func GetLocations(start, count int) ([]Location, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := database.DB.Collection("locations")

	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	locations := []Location{}

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

	return locations, nil
}
