package controllers

import (
	"github.com/codihuston/ustrending/trends-api/api/v1/models"
	"net/http"
)

// GetDailyTrends returns a twitter place closest to a given zipcode
func GetDailyTrends(w http.ResponseWriter, r *http.Request) {
	// get the google trends (an array)
	g := &models.GoogleTrend{}
	results, err := g.GetDailyTrends()
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// handle not found
	if len(results) <= 0 {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, results)
}

// GetDailyTrends returns a twitter place closest to a given zipcode
func GetDailyTrendsByState(w http.ResponseWriter, r *http.Request) {
	// "explores" a trend using this time period (now / today)
	const today = "now 1-d"

	// get the google trends (an array)
	g := &models.GoogleTrend{}
	results, err := g.GetDailyTrendsByState(today)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// handle not found
	if len(results) <= 0 {
		RespondWithError(w, http.StatusNotFound, "Not found")
		return
	}

	RespondWithJSON(w, http.StatusOK, results)
}
