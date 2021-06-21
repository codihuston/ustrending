package controllers

import (
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/public-api/api/v1/models"
)

const (
	locUS  = "US"
	catAll = "all"
	langEn = "EN"
)

// GetGoogleDailyTrends returns a list of google daily trends
func GetGoogleDailyTrends(w http.ResponseWriter, r *http.Request) {
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

func GetGoogleDailyTrendsByState(w http.ResponseWriter, r *http.Request) {
	hl := r.URL.Query().Get("hl")
	loc := r.URL.Query().Get("loc")
	cat := r.URL.Query().Get("cat")

	// validate / default incoming query parameters
	if len(hl) <= 0 {
		hl = langEn
	}

	if len(loc) <= 0 {
		loc = locUS
	}

	if len(cat) <= 0 {
		cat = catAll
	}

	// get the google trends (an array)
	log.Info("hl/loc/cat is", hl, loc, cat)

	// get the google trends (an array)
	g := &models.GoogleTrend{}
	results, err := g.GetDailyTrendsByState(hl, loc, cat)
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

// GetGoogleRealtimeTrends returns a list of realtime google trends
func GetGoogleRealtimeTrends(w http.ResponseWriter, r *http.Request) {
	hl := r.URL.Query().Get("hl")
	loc := r.URL.Query().Get("loc")
	cat := r.URL.Query().Get("cat")

	// validate / default incoming query parameters
	if len(hl) <= 0 {
		hl = langEn
	}

	if len(loc) <= 0 {
		loc = locUS
	}

	if len(cat) <= 0 {
		cat = catAll
	}

	// get the google trends (an array)
	log.Info("hl/loc/cat is", hl, loc, cat)
	g := &models.GoogleTrend{}
	results, err := g.GetRealtimeTrends(hl, loc, cat)

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

// GetGoogleRealtimeTrendsByState returns a list of realtime trends per state, ordered by popularity
func GetGoogleRealtimeTrendsByState(w http.ResponseWriter, r *http.Request) {
	hl := r.URL.Query().Get("hl")
	loc := r.URL.Query().Get("loc")
	cat := r.URL.Query().Get("cat")

	// validate / default incoming query parameters
	if len(hl) <= 0 {
		hl = langEn
	}

	if len(loc) <= 0 {
		loc = locUS
	}

	if len(cat) <= 0 {
		cat = catAll
	}

	// get the google trends (an array)
	log.Info("hl/loc/cat is", hl, loc, cat)
	g := &models.GoogleTrend{}
	results, err := g.GetRealtimeTrendsByState(hl, loc, cat)

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
