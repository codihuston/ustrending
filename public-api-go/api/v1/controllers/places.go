package controllers

import (
	"github.com/codihuston/gorilla-mux-http/api/v1/models"
	"github.com/golang/glog"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

// GetNearestPlaceByPoint assumes will always return a twitter place
func GetNearestPlaceByPoint(w http.ResponseWriter, r *http.Request) {
	long, err := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	glog.Info("Long/lat", long, lat)

	object, err := models.GetNearestPlaceByPoint(long, lat)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, object)
}

// GetNearestPlaceByZipcode returns a twitter place closest to a given zipcode
func GetNearestPlaceByZipcode(w http.ResponseWriter, r *http.Request) {
	// get the zipcode
	zipcode, err := models.GetPlaceByZipCode(mux.Vars(r)["zipcode"])
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// handle not found
	if zipcode.IsEmpty() {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	// found, get the location by point
	long := zipcode.Geometry.Coordinates[0]
	lat := zipcode.Geometry.Coordinates[1]
	if long != 0 && lat != 0 {
		// find place closest to this zipcode
		object, err := models.GetNearestPlaceByPoint(long, lat)
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		// place found
		RespondWithJSON(w, http.StatusOK, object)
		// no zipcode found
	} else {
		RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
}
