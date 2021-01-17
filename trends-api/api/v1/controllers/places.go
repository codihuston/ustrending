package controllers

import (
	"net/http"

	"github.com/codihuston/ustrending/trends-api/api/v1/models"
)

// GetNearestPlaceByPoint assumes will always return a twitter place
func GetPlaces(w http.ResponseWriter, r *http.Request) {
	p := &models.Place{}
	objects, err := p.GetPlaces()
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, objects)
}
