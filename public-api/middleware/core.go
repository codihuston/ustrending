package middleware

import (
	"github.com/codihuston/ustrending/public-api/types"
	"github.com/go-playground/validator/v10"
	"net/http"
	"strings"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

var validate *validator.Validate

/*
	Adapter will execute a series of specified middleware in order from
	left-to-right.
*/
func Adapter(h http.HandlerFunc, m ...Middleware) http.HandlerFunc {
	if len(m) < 1 {
		return h
	}

	context := h

	// loop in reverse to preserve middleware order
	for i := len(m) - 1; i >= 0; i-- {
		context = m[i](context)
	}

	return context

}

func getValidationErrorMessages(err validator.ValidationErrors, lc bool) []types.ValidationErrorType {
	var errors []types.ValidationErrorType

	for _, err := range err {
		var r = err.ActualTag()
		var f string

		if lc {
			f = strings.ToLower(err.StructField())
		} else {
			f = err.StructField()
		}

		validationError := &types.ValidationErrorType{Field: f, Rule: r, Message: err.Error(), Parameter: err.Param()}
		errors = append(errors, *validationError)
	}

	return errors
}
