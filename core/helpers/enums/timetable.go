// Package enums contains the enums for the application
package enums

// Timetable is a type that represents the different timetables for a route
type Timetable string

const (
	// Normal is the normal timetable
	Normal Timetable = "normal"
	// Holiday is the holiday timetable
	Holiday Timetable = "holiday"
)

// AllTimetables is a list of all the timetables
var AllTimetables = []struct {
	Value  Timetable
	TSName string
}{
	{Normal, "NORMAL"},
	{Holiday, "HOLIDAY"},
}
