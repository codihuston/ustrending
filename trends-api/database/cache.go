package database

import (
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/golang/glog"
	"os"
	"strconv"
)

// CacheClient a connection to cache database
var CacheClient *redis.Client
var redisHost string
var redisPort int
var redisDB int
var redisMaxRetries int

func init() {
	redisHost = os.Getenv("REDIS_HOST")

	num, err := strconv.Atoi(os.Getenv("REDIS_DB"))
	if err != nil {
		glog.Fatal("Cound not convert REDIS_DB to integer from string", os.Getenv("REDIS_DB"))
	}
	redisDB = num

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

// InitializeCache returns a redis client
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

// CloseCacheConnection closes the connection to the cache database
func CloseCacheConnection() {
	if CacheClient != nil {
		// disconnect from database
		if err := CacheClient.Close(); err != nil {
			panic(err)
		}
		CacheClient = nil
	}
}
