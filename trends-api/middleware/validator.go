package middleware

import (
	c "github.com/codihuston/ustrending/trends-api/api/v1/controllers"
	"github.com/codihuston/ustrending/trends-api/types"
	"github.com/go-playground/validator/v10"
	"net/http"
)

const invalidQueryMessage = "Invalid query"
const invalidRequestPathMessage = "Invalid request path"

func ValidatePoint(h http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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
						Message: invalidQueryMessage,
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
