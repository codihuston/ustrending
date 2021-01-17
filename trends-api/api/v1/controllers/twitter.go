package controllers

import (
	"net/http"
	"strconv"

	"github.com/dghubble/go-twitter/twitter"
	"github.com/gorilla/mux"

	thirdparty "github.com/codihuston/ustrending/trends-api/api/v1/third-party"
)

// GetDailyTrends returns a twitter place closest to a given zipcode
func GetTrendsByPlace(w http.ResponseWriter, r *http.Request) {
	// get the zipcode
	woeid, err := strconv.ParseInt(mux.Vars(r)["woeid"], 10, 64)

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	placeParams := &twitter.TrendsPlaceParams{WOEID: woeid, Exclude: ""}
	client := thirdparty.GetTwitterClient()
	results, _, err := client.Trends.Place(woeid, placeParams)

	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, results)
}
