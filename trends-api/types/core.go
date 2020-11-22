/*
Generic, non-modal types go here (types used for validation, etc.)
*/
package types

type ErrorResponseBodyType struct {
	Message string                `json:"message"`
	Errors  []ValidationErrorType `json:"errors"`
}

type ErrorResponseType struct {
	Error ErrorResponseBodyType `json:"error"`
}

type ValidationErrorType struct {
	Field     string `json:"field"`
	Rule      string `json:"rule"`
	Message   string `json:"message"`
	Parameter string `json:"parameter"`
}
