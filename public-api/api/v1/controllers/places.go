package controllers

import (
	"net/http"
	"strconv"

	"github.com/codihuston/ustrending/public-api/api/v1/models"
	"github.com/gorilla/mux"
)

// GetPlaces returns a list of Places (all, or by given countryCode)
func GetPlaces(w http.ResponseWriter, r *http.Request) {
	// get the woeid
	countryCode := mux.Vars(r)["countryCode"]
	p := &models.Place{}

	objects, err := p.GetPlaces(countryCode)

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, objects)
}

// GetNearestPlaceByPoint assumes will always return a twitter place
func GetNearestPlaceByPoint(w http.ResponseWriter, r *http.Request) {
	long, err := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	limit, err := strconv.ParseInt(r.URL.Query().Get("limit"), 10, 64)

	place := &models.Place{}
	results, err := place.GetNearestPlaceByPoint(long, lat, limit)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	// handle not found
	if len(results) == 0 {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, results)
}

// GetNearestPlaceByZipcode returns a twitter place closest to a given zipcode
func GetNearestPlaceByZipcode(w http.ResponseWriter, r *http.Request) {
	place := &models.Place{}
	zipcode := &models.ZipCode{}
	limit, err := strconv.ParseInt(r.URL.Query().Get("limit"), 10, 64)

	// get the zipcode
	err = zipcode.GetPlaceByZipCode(mux.Vars(r)["zipcode"])
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
		results, err := place.GetNearestPlaceByPoint(long, lat, limit)
		if err != nil {
			RespondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		// place found
		RespondWithJSON(w, http.StatusOK, results)
		// no zipcode found
	} else {
		RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
}
