package controllers

import (
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/trends-api/api/v1/models"
)

const (
	locUS  = "US"
	catAll = "all"
	langEn = "EN"
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

// GetGoogleTrendInterest fetches trend Explore widgets geowidget, and InterestsByLocation for this trend
func GetGoogleTrendInterest(w http.ResponseWriter, r *http.Request) {
	keyword := r.URL.Query().Get("keyword")
	loc := r.URL.Query().Get("loc")
	timePeriod := r.URL.Query().Get("time")
	lang := r.URL.Query().Get("lang")

	// get the google trends (an array)
	g := &models.GoogleTrend{}
	results, err := g.GetTrendInterest(keyword, loc, timePeriod, lang)
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
