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

func (a *App) Initialize(user, password, dbname string) {

	glog.Info("Initializing service connections...")
	glog.Info("TEST!!!")
	glog.Info("TEST!!!")
	glog.Info("TEST!!!")
	database.Initialize(user, password, dbname)

	a.Router = mux.NewRouter()

	a.initializeRoutes()
}

func (a *App) Run(addr string) {
	loggedRouter := handlers.LoggingHandler(os.Stdout, a.Router)
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
