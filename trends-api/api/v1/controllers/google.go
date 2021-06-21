package controllers

import (
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/codihuston/ustrending/trends-api/api/v1/models"
)

const (
	DEFAULT_LOCATION    = "US"
	DEFAULT_CATEGORY    = "all"
	DEFAULT_LANGUAGE    = "EN"
	DEFAULT_TIME_PERIOD = "now 1-d"
)

// GetDailyTrends returns a list of google daily trends
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
		hl = DEFAULT_LANGUAGE
	}

	if len(loc) <= 0 {
		loc = DEFAULT_LOCATION
	}

	if len(cat) <= 0 {
		cat = DEFAULT_CATEGORY
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
		hl = DEFAULT_LANGUAGE
	}

	if len(loc) <= 0 {
		loc = DEFAULT_LOCATION
	}

	if len(cat) <= 0 {
		cat = DEFAULT_CATEGORY
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

// GetDailyTrendsByState returns a list of states and their trends, sorted by most popular
func GetDailyTrendsByState(w http.ResponseWriter, r *http.Request) {
	hl := r.URL.Query().Get("hl")
	loc := r.URL.Query().Get("loc")
	cat := r.URL.Query().Get("cat")

	// validate / default incoming query parameters
	if len(hl) <= 0 {
		hl = DEFAULT_LANGUAGE
	}

	if len(loc) <= 0 {
		loc = DEFAULT_LOCATION
	}

	if len(cat) <= 0 {
		cat = DEFAULT_CATEGORY
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

// GetGoogleTrendInterest fetches trend Explore widgets geowidget, and InterestsByLocation for this trend
func GetGoogleTrendInterest(w http.ResponseWriter, r *http.Request) {
	keyword := r.URL.Query().Get("keyword")
	loc := r.URL.Query().Get("loc")
	timePeriod := r.URL.Query().Get("time")
	lang := r.URL.Query().Get("lang")

	if len(keyword) == 0 {
		RespondWithError(w, http.StatusBadRequest, "Field 'keyword' is required.")
		return
	}

	if len(loc) == 0 {
		loc = DEFAULT_LOCATION
	}

	if len(timePeriod) == 0 {
		timePeriod = DEFAULT_TIME_PERIOD
	}

	if len(lang) == 0 {
		lang = DEFAULT_LANGUAGE
	}
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
