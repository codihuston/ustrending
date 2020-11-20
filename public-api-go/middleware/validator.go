package middleware

import (
	c "github.com/codihuston/gorilla-mux-http/api/v1/controllers"
	"github.com/codihuston/gorilla-mux-http/types"
	"github.com/go-playground/validator/v10"
	"net/http"
)

func ValidatePoint(h http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		errorMessage := "Invalid query."
		validate = validator.New()
		object := &types.Point{
			Long: r.URL.Query().Get("long"),
			Lat:  r.URL.Query().Get("lat"),
		}

		// returns nil or ValidationErrors ( []FieldError )
		err := validate.Struct(object)
		if err != nil {
			validationErrors := getValidationErrorMessages(err.(validator.ValidationErrors), true)

			c.RespondWithJSON(w, http.StatusUnprocessableEntity,
				&types.ErrorResponseType{
					Error: types.ErrorResponseBodyType{
						Message: errorMessage,
						Errors:  validationErrors,
					},
				})
			return
		} else {
			// Call the next handler, which can be another middleware in the chain,
			// or the final handler.
			h.ServeHTTP(w, r)
		}
	})
}
