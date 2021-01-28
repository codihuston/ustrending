// app.go

package main

import (
	c "github.com/codihuston/ustrending/trends-api/api/v1/controllers"
	"github.com/codihuston/ustrending/trends-api/database"

	// mw "github.com/codihuston/ustrending/trends-api/middleware"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

type App struct {
	Router *mux.Router
}

// Initialize inits connections to dependant services
func (a *App) Initialize() {

	log.Info("Connecting to services...")
	database.InitializeDatabase()
	database.InitializeCache()

	a.Router = mux.NewRouter()

	a.initializeRoutes()
}

// Run starts the http server
func (a *App) Run(addr string) {
	// add http logger to router handler
	loggedRouter := handlers.LoggingHandler(os.Stdout, a.Router)

	// init the http server
	log.Fatal(http.ListenAndServe(":3000", loggedRouter))
}

func (a *App) initializeRoutes() {
	a.Router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("This is a catch-all route"))
	})
	// Note: this works, but I cannot pass in a specific
	a.Router.HandleFunc("/google/trends/realtime", c.GetGoogleRealtimeTrends).Methods("GET")
	a.Router.HandleFunc("/google/trends/interest", c.GetGoogleTrendInterest).Methods("GET")
	a.Router.HandleFunc("/google/trends/realtime/states", c.GetGoogleRealtimeTrendsByState).Methods("GET")
	a.Router.HandleFunc("/google/trends/daily", c.GetDailyTrends).Methods("GET")
	a.Router.HandleFunc("/google/trends/daily/states", c.GetDailyTrendsByState).Methods("GET")
	a.Router.HandleFunc("/places", c.GetPlaces).Methods("GET")
	a.Router.HandleFunc("/places/{countryCode:[a-zA-Z]+}", c.GetPlaces).Methods("GET")
	a.Router.HandleFunc("/twitter/trends/{woeid:[0-9]+}", c.GetTrendsByPlace).Methods("GET")
}
