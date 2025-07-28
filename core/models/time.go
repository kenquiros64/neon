package models

// Time represents a time in the database
type Time struct {
	Hour   int `json:"hour" bson:"hour" clover:"hour"`
	Minute int `json:"minute" bson:"minute" clover:"minute"`
}
