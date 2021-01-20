package controllers

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/codihuston/ustrending/public-api/api/v1/models"
)

// GetTwitterRealtimeTrends returns a hashmap containg a { woeid: [] } of twitter trends
func GetTwitterRealtimeTrends(w http.ResponseWriter, r *http.Request) {
	// get the google trends (an array)
	model := &models.TwitterTrend{}
	results, err := model.GetTrends()
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

// GetTwitterRealtimeTrends returns a hashmap containg a { woeid: [] } of twitter trends
func GetTwitterRealtimeTrendsByPlace(w http.ResponseWriter, r *http.Request) {
	// get the woeid
	woeid, err := strconv.ParseInt(mux.Vars(r)["woeid"], 10, 64)
	// get the google trends (an array)
	model := &models.TwitterTrend{}
	results, err := model.GetTrendsByPlace(woeid)
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
