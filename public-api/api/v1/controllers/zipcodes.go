package controllers

import (
	"net/http"
	"strconv"

	"github.com/codihuston/ustrending/public-api/api/v1/models"
	"github.com/gorilla/mux"
)

// GetNearestZipcodeByPoint assumes will always return a twitter place
func GetNearestZipcodeByPoint(w http.ResponseWriter, r *http.Request) {
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
func GetZipcode(w http.ResponseWriter, r *http.Request) {
	zipcode := &models.ZipCode{}

	// get the zipcode
	results, err := zipcode.GetZipCode(mux.Vars(r)["zipcode"])

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// handle not found
	if results.IsEmpty() {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, results)
	return
}
