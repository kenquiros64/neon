package models

import "time"

// Report represents a report in the database
type Report struct {
	ID              int64      `json:"id" db:"id" goqu:"omitempty,skipinsert"`
	Username        string     `json:"username" db:"username" goqu:"omitempty"`
	InitialCash     int        `json:"initial_cash" db:"initial_cash" goqu:"omitempty"`
	FinalCash       *int       `json:"final_cash" db:"final_cash" goqu:"omitnil"`
	Status          bool       `json:"status" db:"status" goqu:"omitempty"`
	TotalCash       int        `json:"total_cash" db:"total_cash" goqu:"omitempty"`
	TotalTickets    int        `json:"total_tickets" db:"total_tickets" goqu:"omitempty"`
	TotalGold       int        `json:"total_gold" db:"total_gold" goqu:"omitempty"`
	TotalNull       int        `json:"total_null" db:"total_null" goqu:"omitempty"`
	TotalFare       int        `json:"total_fare" db:"total_fare" goqu:"omitempty"`
	CashVerified    bool       `json:"cash_verified" db:"cash_verified" goqu:"omitempty"`
	PartialClosedAt *time.Time `json:"partial_closed_at" db:"partial_closed_at" goqu:"omitnil"`
	ClosedAt        *time.Time `json:"closed_at" db:"closed_at" goqu:"omitnil"`
	CreatedAt       *time.Time `json:"created_at" db:"created_at" goqu:"skipupdate"`
}
