package remote

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"neon/core/constants"
	"neon/core/models"
)

// ReportRepository persists report snapshots to remote MySQL.
type ReportRepository struct {
	db *sql.DB
}

// NewReportRepository creates a remote report repository using an open MySQL pool.
func NewReportRepository(db *sql.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

// UpsertReport inserts or updates a row keyed by local SQLite id.
func (r *ReportRepository) UpsertReport(ctx context.Context, report *models.Report) error {
	if r.db == nil {
		return fmt.Errorf("mysql db is not available")
	}
	if report == nil || report.ID == 0 {
		return fmt.Errorf("invalid report for upsert")
	}

	tbl := constants.RemoteReportsMySQLTable
	now := time.Now().UTC().Format(time.RFC3339)

	q := fmt.Sprintf(`
INSERT INTO %s (
  local_id, username, timetable, partial_tickets, partial_cash, partial_cash_received,
  final_tickets, final_cash, final_cash_received, status, total_gold, total_gold_cash,
  total_null, total_null_cash, total_regular, total_regular_cash,
  partial_closed_at, closed_at, created_at, partial_closed_by, closed_by, remote_saved_at
) VALUES (
  ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
)
ON DUPLICATE KEY UPDATE
  username=VALUES(username),
  timetable=VALUES(timetable),
  partial_tickets=VALUES(partial_tickets),
  partial_cash=VALUES(partial_cash),
  partial_cash_received=VALUES(partial_cash_received),
  final_tickets=VALUES(final_tickets),
  final_cash=VALUES(final_cash),
  final_cash_received=VALUES(final_cash_received),
  status=VALUES(status),
  total_gold=VALUES(total_gold),
  total_gold_cash=VALUES(total_gold_cash),
  total_null=VALUES(total_null),
  total_null_cash=VALUES(total_null_cash),
  total_regular=VALUES(total_regular),
  total_regular_cash=VALUES(total_regular_cash),
  partial_closed_at=VALUES(partial_closed_at),
  closed_at=VALUES(closed_at),
  created_at=VALUES(created_at),
  partial_closed_by=VALUES(partial_closed_by),
  closed_by=VALUES(closed_by),
  remote_saved_at=VALUES(remote_saved_at)
`, tbl)

	status := 0
	if report.Status {
		status = 1
	}

	args := []interface{}{
		report.ID,
		report.Username,
		string(report.Timetable),
		report.PartialTickets,
		report.PartialCash,
		report.PartialCashReceived,
		report.FinalTickets,
		report.FinalCash,
		report.FinalCashReceived,
		status,
		report.TotalGold,
		report.TotalGoldCash,
		report.TotalNull,
		report.TotalNullCash,
		report.TotalRegular,
		report.TotalRegularCash,
		strPtr(report.PartialClosedAt),
		strPtr(report.ClosedAt),
		strPtr(report.CreatedAt),
		strPtr(report.PartialClosedBy),
		strPtr(report.ClosedBy),
		now,
	}

	_, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return fmt.Errorf("failed to upsert report to MySQL: %w", err)
	}
	return nil
}

func strPtr(p *string) interface{} {
	if p == nil {
		return nil
	}
	return *p
}
