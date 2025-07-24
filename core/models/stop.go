package models

// Stop represents a stop in the database
type Stop struct {
	Name     string `bson:"name" json:"name" clover:"name"`
	Code     string `bson:"code" json:"code" clover:"code"`
	Fare     int    `bson:"fare" json:"fare" clover:"fare"`
	GoldFare int    `bson:"gold_fare" json:"gold_fare" clover:"gold_fare"`
	IsMain   bool   `bson:"is_main" json:"is_main" clover:"is_main"`
}
