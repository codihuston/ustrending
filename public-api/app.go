// app.go

package main

import (
	"net/http"
	"os"

	c "github.com/codihuston/ustrending/public-api/api/v1/controllers"
	"github.com/codihuston/ustrending/public-api/database"
	mw "github.com/codihuston/ustrending/public-api/middleware"
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
	a.Router.HandleFunc("/google/trends/daily", c.GetGoogleDailyTrends).Methods("GET")
	a.Router.HandleFunc("/google/trends/daily/states", c.GetGoogleDailyTrendsByState).Methods("GET")
	a.Router.HandleFunc("/google/trends/realtime", c.GetGoogleRealtimeTrends).Methods("GET")
	a.Router.HandleFunc("/google/trends/realtime/states", c.GetGoogleRealtimeTrendsByState).Methods("GET")
	a.Router.HandleFunc("/zipcodes/nearest/point", mw.Adapter(c.GetNearestZipcodeByPoint, mw.ValidatePoint)).Methods("GET")
	a.Router.HandleFunc("/zipcodes/{zipcode:[0-9]{5}}", c.GetZipcode).Methods("GET")

}
