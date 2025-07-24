package models

// Route represents a route in the database
type Route struct {
	ID               string `bson:"_id" json:"id" clover:"id"`
	Departure        string `bson:"departure" json:"departure" clover:"departure"`
	Destination      string `bson:"destination" json:"destination" clover:"destination"`
	Stops            []Stop `bson:"stops" json:"stops" clover:"stops"`
	Timetable        []Time `bson:"timetable" json:"timetable" clover:"timetable"`
	HolidayTimetable []Time `bson:"holiday_timetable" json:"holiday_timetable" clover:"holiday_timetable"`
}
