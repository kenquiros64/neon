package models

// Report represents a report in the database
type Report struct {
	ID               int64   `json:"id" db:"id" goqu:"omitempty,skipinsert"`
	Username         string  `json:"username" db:"username" goqu:"omitempty"`
	PartialTickets   int     `json:"partial_tickets" db:"partial_tickets" goqu:"omitempty"`
	PartialCash      int     `json:"partial_cash" db:"partial_cash" goqu:"omitempty"`
	FinalCash        int     `json:"final_cash" db:"final_cash" goqu:"omitempty"`
	Status           bool    `json:"status" db:"status"`
	TotalCash        int     `json:"total_cash" db:"total_cash" goqu:"omitempty"`
	TotalTickets     int     `json:"total_tickets" db:"total_tickets" goqu:"omitempty"`
	TotalGold        int     `json:"total_gold" db:"total_gold" goqu:"omitempty"`
	TotalGoldCash    int     `json:"total_gold_cash" db:"total_gold_cash" goqu:"omitempty"`
	TotalNull        int     `json:"total_null" db:"total_null" goqu:"omitempty"`
	TotalNullCash    int     `json:"total_null_cash" db:"total_null_cash" goqu:"omitempty"`
	TotalRegular     int     `json:"total_regular" db:"total_regular" goqu:"omitempty"`
	TotalRegularCash int     `json:"total_regular_cash" db:"total_regular_cash" goqu:"omitempty"`
	PartialClosedAt  *string `json:"partial_closed_at" db:"partial_closed_at" goqu:"omitnil"`
	ClosedAt         *string `json:"closed_at" db:"closed_at" goqu:"omitnil"`
	CreatedAt        *string `json:"created_at" db:"created_at" goqu:"skipupdate"`
}
