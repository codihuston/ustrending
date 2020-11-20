package controllers

import (
	"github.com/codihuston/gorilla-mux-http/api/v1/models"
	"github.com/golang/glog"
	"net/http"
	"strconv"
)

func GetNearestPlaceByPoint(w http.ResponseWriter, r *http.Request) {
	long, err := strconv.ParseFloat(r.URL.Query().Get("long"), 64)
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	glog.Info("Long/lat", long, lat)

	object, err := models.GetNearestPlaceByPoint(long, lat)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, object)
}

func GetNearestPlaceByZipcode(w http.ResponseWriter, r *http.Request) {
	count, _ := strconv.Atoi(r.FormValue("count"))
	start, _ := strconv.Atoi(r.FormValue("start"))

	if count > 10 || count < 1 {
		count = 10
	}
	if start < 0 {
		start = 0
	}

	products, err := models.GetProducts(start, count)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	RespondWithJSON(w, http.StatusOK, products)
}
