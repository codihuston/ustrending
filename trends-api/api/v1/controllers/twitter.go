package controllers

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/codihuston/ustrending/trends-api/api/v1/models"
)

// GetDailyTrends returns a twitter place closest to a given zipcode
func GetTrendsByPlace(w http.ResponseWriter, r *http.Request) {
	// get the woeid
	woeid, err := strconv.ParseInt(mux.Vars(r)["woeid"], 10, 64)
	model := &models.Twitter{}

	result, err := model.GetTrendsByPlace(woeid)

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, result)
}
