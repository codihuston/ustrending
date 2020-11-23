package controllers

import (
	"github.com/codihuston/ustrending/public-api/api/v1/models"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

// GetNearestPlaceByPoint assumes will always return a twitter place
func GetNearestPlaceByPoint(w http.ResponseWriter, r *http.Request) {
	long, err := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)

	object := &models.Place{}
	err = object.GetNearestPlaceByPoint(long, lat)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	// handle not found
	if object.IsEmpty() {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, object)
}

// GetNearestPlaceByZipcode returns a twitter place closest to a given zipcode
func GetNearestPlaceByZipcode(w http.ResponseWriter, r *http.Request) {
	place := &models.Place{}
	zipcode := &models.ZipCode{}
	// get the zipcode
	err := zipcode.GetPlaceByZipCode(mux.Vars(r)["zipcode"])
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
		err := place.GetNearestPlaceByPoint(long, lat)
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		// place found
		RespondWithJSON(w, http.StatusOK, place)
		// no zipcode found
	} else {
		RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
}
