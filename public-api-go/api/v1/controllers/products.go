package controllers

import (
	"github.com/codihuston/gorilla-mux-http/api/v1/models"
	"net/http"
	"strconv"
)

// func GetProduct(w http.ResponseWriter, r *http.Request) {
// 	vars := mux.Vars(r)
// 	id, err := strconv.Atoi(vars["id"])
// 	if err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid product ID")
// 		return
// 	}

// 	p := models.Product{ID: id}
// 	if err := p.GetProduct(); err != nil {
// 		switch err {
// 		case sql.ErrNoRows:
// 			respondWithError(w, http.StatusNotFound, "Product not found")
// 		default:
// 			respondWithError(w, http.StatusInternalServerError, err.Error())
// 		}
// 		return
// 	}

// 	respondWithJSON(w, http.StatusOK, p)
// }

func GetProducts(w http.ResponseWriter, r *http.Request) {
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

// func CreateProduct(w http.ResponseWriter, r *http.Request) {
// 	var p models.Product
// 	decoder := json.NewDecoder(r.Body)
// 	if err := decoder.Decode(&p); err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
// 		return
// 	}
// 	defer r.Body.Close()

// 	if err := p.CreateProduct(); err != nil {
// 		respondWithError(w, http.StatusInternalServerError, err.Error())
// 		return
// 	}

// 	respondWithJSON(w, http.StatusCreated, p)
// }

// func UpdateProduct(w http.ResponseWriter, r *http.Request) {
// 	vars := mux.Vars(r)
// 	id, err := strconv.Atoi(vars["id"])
// 	if err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid product ID")
// 		return
// 	}

// 	var p models.Product
// 	decoder := json.NewDecoder(r.Body)
// 	if err := decoder.Decode(&p); err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid resquest payload")
// 		return
// 	}
// 	defer r.Body.Close()
// 	p.ID = id

// 	if err := p.UpdateProduct(); err != nil {
// 		respondWithError(w, http.StatusInternalServerError, err.Error())
// 		return
// 	}

// 	respondWithJSON(w, http.StatusOK, p)
// }

// func DeleteProduct(w http.ResponseWriter, r *http.Request) {
// 	vars := mux.Vars(r)
// 	id, err := strconv.Atoi(vars["id"])
// 	if err != nil {
// 		respondWithError(w, http.StatusBadRequest, "Invalid Product ID")
// 		return
// 	}

// 	p := models.Product{ID: id}
// 	if err := p.DeleteProduct(); err != nil {
// 		respondWithError(w, http.StatusInternalServerError, err.Error())
// 		return
// 	}

// 	respondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
// }
