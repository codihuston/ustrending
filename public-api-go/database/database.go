package database

import (
	"context"
	"github.com/golang/glog"
	// "database/sql"
	"fmt"
	// _ "github.com/lib/pq"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"strconv"
	"time"
)

var Client *mongo.Client
var DB *mongo.Database
var mongoHost string
var mongoDB string
var mongoUsername string
var mongoPassword string
var mongoPort int

func init() {
	mongoHost = os.Getenv("MONGO_HOST")
	mongoDB = os.Getenv("MONGO_DB")
	mongoUsername = os.Getenv("MONGO_USERNAME")
	mongoPassword = os.Getenv("MONGO_PASSWORD")
	port, err := strconv.Atoi(os.Getenv("MONGO_PORT"))

	if err != nil {
		glog.Fatal("Cound not convert MONGO_PORT to integer from string", mongoPort)
	}

	mongoPort = port
}

func getConnectionString() (string, string) {
	credentialString := ""
	safeCredentialString := ""

	if mongoUsername != "" && mongoPassword != "" {
		credentialString = fmt.Sprintf("%s:%s@", mongoUsername, mongoPassword)
		safeCredentialString = fmt.Sprintf("%s:%s@", "REDACTED", "REDACTED")
	}

	connectionString := fmt.Sprintf("mongodb://%s%s:%d/%s", credentialString, mongoHost, mongoPort, mongoDB)
	safeString := fmt.Sprintf("mongodb://%s%s:%d/%s", safeCredentialString, mongoHost, mongoPort, mongoDB)
	return connectionString, safeString
}

func Initialize(user, password, dbname string) *mongo.Database {

	if Client == nil {
		connectionString, safeString := getConnectionString()

		glog.Info("Connecting to", safeString)
		// connect to mongodb
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionString))

		if err != nil {
			glog.Fatal(err)
		}
		Client = client
		DB = client.Database(mongoDB)
	}
	return DB
}

func Close() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// disconnect from database
	if err := Client.Disconnect(ctx); err != nil {
		panic(err)
	}
}
