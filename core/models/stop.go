package models

// Stop represents a stop in the database
type Stop struct {
	Name     string `json:"name" bson:"name" clover:"name"`
	Code     string `json:"code" bson:"code" clover:"code"`
	Fare     int    `json:"fare" bson:"fare" clover:"fare"`
	GoldFare int    `json:"gold_fare" bson:"gold_fare" clover:"gold_fare"`
	IsMain   bool   `json:"is_main" bson:"is_main" clover:"is_main"`
}
