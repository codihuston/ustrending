/*
Generic, non-modal types go here (types used for validation, etc.)
*/
package types

type Point struct {
	Long string `validate:"required,longitude"`
	Lat  string `validate:"required,latitude"`
}

type ErrorResponseBodyType struct {
	Message string                `json:"message"`
	Errors  []ValidationErrorType `json:"errors"`
}

type ErrorResponseType struct {
	Error ErrorResponseBodyType `json:"error"`
}

type ValidationErrorType struct {
	Field string `json:"field"`
	Rule  string `json:"rule"`
}
