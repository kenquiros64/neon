package models

// Count represents a count of tickets
type Count struct {
	Key       string `json:"key" clover:"key"`
	Value     int    `json:"value" clover:"value"`
	LastReset string `json:"last_reset" clover:"last_reset"`
}
