package controllers

import (
	"github.com/codihuston/gorilla-mux-http/api/v1/models"
	"net/http"
)

// GetDailyTrends returns a twitter place closest to a given zipcode
func GetDailyTrends(w http.ResponseWriter, r *http.Request) {
	// get the google trends (an array)
	g := &models.GoogleTrend{}
	results := make([]models.GoogleTrend, 0, 20)
	err := g.GetDailyTrends(&results)
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
