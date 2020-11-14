package database

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"strconv"
	"time"
)

var DBClient *mongo.Client
var DB *mongo.Database
var CacheClient *redis.Client

var mongoHost string
var mongoDB string
var mongoUsername string
var mongoPassword string
var mongoPort int
var redisHost string
var redisPort int
var redisDB int
var redisMaxRetries int

func init() {
	mongoHost = os.Getenv("MONGO_HOST")
	mongoDB = os.Getenv("MONGO_DB")
	mongoUsername = os.Getenv("MONGO_USERNAME")
	mongoPassword = os.Getenv("MONGO_PASSWORD")
	redisHost = os.Getenv("REDIS_HOST")
	num, err := strconv.Atoi(os.Getenv("MONGO_PORT"))

	if err != nil {
		glog.Fatal("Cound not convert MONGO_PORT to integer from string", os.Getenv("MONGO_PORT"))
	}
	mongoPort = num

	db, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		glog.Fatal("Cound not convert REDIS_DB to integer from string", os.Getenv("REDIS_DB"))
	}
	redisDB = db

	num, err = strconv.Atoi(os.Getenv("REDIS_PORT"))
	if err != nil {
		glog.Fatal("Cound not convert REDIS_PORT to integer from string", os.Getenv("REDIS_PORT"))
	}
	redisPort = num

	num, err = strconv.Atoi(os.Getenv("REDIS_RECONNECT_ATTEMPTS"))
	if err != nil {
		glog.Fatal("Cound not convert REDIS_RECONNECT_ATTEMPTS to integer from string", os.Getenv("REDIS_RECONNECT_ATTEMPTS"))
	}
	redisMaxRetries = num
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

func InitializeDatabase() *mongo.Database {

	if DBClient == nil {
		connectionString, safeString := getConnectionString()
		glog.Info("Connecting to", safeString)

		// connect to mongodb
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		client, err := mongo.Connect(ctx, options.Client().ApplyURI(connectionString))

		if err != nil {
			glog.Fatal(err)
		}
		DBClient = client
		DB = client.Database(mongoDB)
	}
	return DB
}

func Close() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// disconnect from database
	if err := DBClient.Disconnect(ctx); err != nil {
		panic(err)
	}
}

func InitializeCache() *redis.Client {

	if CacheClient == nil {
		addr := fmt.Sprintf("%s:%d", redisHost, redisPort)
		rdb := redis.NewClient(&redis.Options{
			Addr:       addr,
			Password:   "",
			DB:         redisDB,
			MaxRetries: redisMaxRetries,
		})

		CacheClient = rdb
	}
	return CacheClient
}
