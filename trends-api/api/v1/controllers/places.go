package controllers

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/codihuston/ustrending/trends-api/api/v1/models"
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
