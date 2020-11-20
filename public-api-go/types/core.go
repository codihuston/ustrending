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

type GeometryPoint struct {
	Type        string    `json:"type" bson:"type"`
	Coordinates []float64 `json:"coordinates" bson:"coordinates"`
}

type ValidationErrorType struct {
	Field     string `json:"field"`
	Rule      string `json:"rule"`
	Message   string `json:"message"`
	Parameter string `json:"parameter"`
}
