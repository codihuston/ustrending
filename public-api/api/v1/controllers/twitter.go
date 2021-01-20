package controllers

import (
	"net/http"

	"github.com/codihuston/ustrending/public-api/api/v1/models"
)

// GetRealtimeTrends returns a twitter place closest to a given zipcode
func GetTwitterRealtimeTrends(w http.ResponseWriter, r *http.Request) {
	// get the google trends (an array)
	model := &models.TwitterTrend{}
	results, err := model.GetRealtimeTrends()
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
