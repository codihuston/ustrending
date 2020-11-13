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

type Product struct {
	ID    primitive.ObjectID `json:"_id" bson:"_id"`
	Name  string             `json:"name" bson:"name"`
	Price float64            `json:"price" bson:"price"`
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

func GetProducts(start, count int) ([]Product, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := database.DB.Collection("products")

	cur, err := collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	products := []Product{}

	for cur.Next(ctx) {
		// var result bson.M
		var result = Product{}
		err := cur.Decode(&result)
		if err != nil {
			glog.Fatal(err)
		}
		glog.Info(result)
		// do something with result....
		products = append(products, result)
	}

	return products, nil
}
