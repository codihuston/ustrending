// app.go

package main

import (
	"github.com/codihuston/gorilla-mux-http/api/v1/controllers"
	"github.com/codihuston/gorilla-mux-http/database"
	"github.com/golang/glog"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"net/http"
	"os"
)

type App struct {
	Router *mux.Router
}

// Initialize inits connections to dependant services
func (a *App) Initialize() {

	glog.Info("Connecting to services...")
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
	glog.Fatal(http.ListenAndServe(":3000", loggedRouter))
}

func (a *App) initializeRoutes() {
	a.Router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("This is a catch-all route"))
	})
	a.Router.HandleFunc("/products", controllers.GetProducts).Methods("GET")
	a.Router.HandleFunc("/locations", controllers.GetLocations).Methods("GET")
	// a.Router.HandleFunc("/product", controllers.CreateProduct).Methods("POST")
	// a.Router.HandleFunc("/product/{id:[0-9]+}", controllers.GetProduct).Methods("GET")
	// a.Router.HandleFunc("/product/{id:[0-9]+}", controllers.UpdateProduct).Methods("PUT")
	// a.Router.HandleFunc("/product/{id:[0-9]+}", controllers.DeleteProduct).Methods("DELETE")
}
