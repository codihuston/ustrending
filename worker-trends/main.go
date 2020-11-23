package main

import (
	"fmt"
	"github.com/robfig/cron/v3"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func getAPIString() string {
	return fmt.Sprintf("http://%s:%s", os.Getenv("TRENDS_API_HOST"), os.Getenv("TRENDS_API_PORT"))
}

func getGoogleTrends() {
	// this endpoint queries daily trends, and builds state trends, and caches.
	var uri = getAPIString() + "/google/trends/daily/states"

	log.Info("Querying uri:", uri)

	// query the api; do nothing with the response
	_, err := http.Get(uri)

	// handle error
	if err != nil {
		log.Fatal(err)
		return
	}

	// assume successful
	log.Info("Query successful!")
}

/*
TODO:
- implement cronjob
- send http requests to trends-api to update trending data
*/
func main() {
	// run the commands immediately
	log.Println("Run initial request")
	getGoogleTrends()
	log.Println("DONE with initial requests")

	// configure schedules for re-runs
	c := cron.New()

	// update google trends every minute
	c.AddFunc("* * * * *", func() {
		log.Println("Every minute")
		getGoogleTrends()
	})
	c.AddFunc("*/30 * * * *", func() {
		log.Println("Every 30 minutes")
		getGoogleTrends()
	})

	// start cronjobs
	c.Start()

	// Handle sigterm and await termChan signal
	termChan := make(chan os.Signal)
	signal.Notify(termChan, syscall.SIGINT, syscall.SIGTERM)

	<-termChan // Blocks here until interrupted

	// Handle shutdown
	log.Println("*********************************\nShutdown signal received\n*********************************")
	log.Println("Shutting down!")
}
