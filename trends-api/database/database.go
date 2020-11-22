package database

import (
	"context"
	"fmt"
	"github.com/golang/glog"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"strconv"
	"time"
)

// DBClient is a mongo connection
var DBClient *mongo.Client

// DB is a reference to the mongo database that this app uses
var DB *mongo.Database

// ErrNoDocuments is a ref to mongo error thrown when no documents are found
var ErrNoDocuments = mongo.ErrNoDocuments

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
	num, err := strconv.Atoi(os.Getenv("MONGO_PORT"))

	if err != nil {
		glog.Fatal("Cound not convert MONGO_PORT to integer from string", os.Getenv("MONGO_PORT"))
	}
	mongoPort = num
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

// GetDatabaseConnection returns a database connection (or initializes)
func GetDatabaseConnection() *mongo.Database {
	if DBClient != nil && DB != nil {
		return DB
	}
	return InitializeDatabase()
}

// InitializeDatabase creates a database connection
func InitializeDatabase() *mongo.Database {
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
	return DB
}

// CloseDatabaseConnection closes the connection to the database
func CloseDatabaseConnection() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// disconnect from database
	if err := DBClient.Disconnect(ctx); err != nil {
		panic(err)
	} else {
		DBClient = nil
		DB = nil
	}
}
