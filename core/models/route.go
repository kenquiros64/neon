package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

// Route represents a route in the database
type Route struct {
	ID               bson.ObjectID `json:"id" bson:"_id" clover:"id"`
	Departure        string        `json:"departure" bson:"departure" clover:"departure"`
	Destination      string        `json:"destination" bson:"destination" clover:"destination"`
	Stops            []Stop        `json:"stops" bson:"stops" clover:"stops"`
	Timetable        []Time        `json:"timetable" bson:"timetable" clover:"timetable"`
	HolidayTimetable []Time        `json:"holiday_timetable" bson:"holiday_timetable" clover:"holiday"`
}

// IsEmpty checks if the route is empty
func (r *Route) IsEmpty() bool {
	return r.Departure == "" ||
		r.Destination == "" ||
		len(r.Stops) == 0 ||
		len(r.Timetable) == 0 ||
		len(r.HolidayTimetable) == 0
}
