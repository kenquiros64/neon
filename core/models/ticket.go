package models

// Ticket represents a ticket in the database
type Ticket struct {
	ID          int64  `json:"id" db:"id" goqu:"omitempty,skipinsert"`
	Departure   string `json:"departure" db:"departure" goqu:"omitempty"`
	Destination string `json:"destination" db:"destination" goqu:"omitempty"`
	Username    string `json:"username" db:"username" goqu:"omitempty"`
	Stop        string `json:"stop" db:"stop" goqu:"omitempty"`
	Time        string `json:"time" db:"time" goqu:"omitempty"`
	Fare        int    `json:"fare" db:"fare" goqu:"omitempty"`
	IDNumber    string `json:"id_number" db:"id_number" goqu:"omitempty"`
	IsGold      bool   `json:"is_gold" db:"is_gold" goqu:"omitempty"`
	IsNull      bool   `json:"is_null" db:"is_null" goqu:"omitempty"`
	ReportID    int64  `json:"report_id" db:"report_id" goqu:"omitempty"`
	CreatedAt   string `json:"created_at" db:"created_at" goqu:"skipupdate"`
	UpdatedAt   string `json:"updated_at" db:"updated_at" goqu:"omitnil"`
}
