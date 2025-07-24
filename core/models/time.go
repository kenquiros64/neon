package models

// Time represents a time in the database
type Time struct {
	Hour   int `bson:"hour" json:"hour" clover:"hour"`
	Minute int `bson:"minute" json:"minute" clover:"minute"`
}
