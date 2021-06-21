package database

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
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
		log.Fatal("Cound not convert REDIS_DB to integer from string", os.Getenv("REDIS_DB"))
	}
	redisDB = num

	num, err = strconv.Atoi(os.Getenv("REDIS_PORT"))
	if err != nil {
		log.Fatal("Cound not convert REDIS_PORT to integer from string", os.Getenv("REDIS_PORT"))
	}
	redisPort = num

	num, err = strconv.Atoi(os.Getenv("REDIS_RECONNECT_ATTEMPTS"))
	if err != nil {
		log.Fatal("Cound not convert REDIS_RECONNECT_ATTEMPTS to integer from string", os.Getenv("REDIS_RECONNECT_ATTEMPTS"))
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

/**
* Will set a key in redis with a boolean value.
 */
func SetProxyKey(ctx context.Context, cacheKey string, ttl time.Duration) (bool, error) {
	err := CacheClient.Set(ctx, cacheKey, true, ttl).Err()
	if err != nil {
		return false, err
	}
	return true, nil
}

/**
* Will return true if a given key is set. If a proxy key is not set,
* then the application should be notified to update any other cache values,
* followed by setting the proxy key for some amount of time. This allows us to
* persist data indefinitely so the front-end client can still display data (even if it is old)
* should the worker process fail to update this dat for any reason.
 */
func GetProxyKey(ctx context.Context, cacheKey string) (bool, error) {
	_, err := CacheClient.Get(ctx, cacheKey).Result()

	if err != nil {
		if err == redis.Nil {
			return false, nil
		}
		return true, err
	}

	return true, err
}

// database.CacheClient.Get(ctx, cacheKey).Result()
