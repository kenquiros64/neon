package local

import (
	"database/sql"
	"neon/core/models"

	"github.com/doug-martin/goqu/v9"
)

// reportSelect omits legacy columns (e.g. area) so older DBs keep working.
func reportSelect() *goqu.SelectDataset {
	return dialect.Select(
		goqu.C("id"),
		goqu.C("username"),
		goqu.C("timetable"),
		goqu.C("partial_tickets"),
		goqu.C("partial_cash"),
		goqu.C("partial_cash_received"),
		goqu.C("final_tickets"),
		goqu.C("final_cash"),
		goqu.C("final_cash_received"),
		goqu.C("status"),
		goqu.C("total_gold"),
		goqu.C("total_gold_cash"),
		goqu.C("total_null"),
		goqu.C("total_null_cash"),
		goqu.C("total_regular"),
		goqu.C("total_regular_cash"),
		goqu.C("partial_closed_at"),
		goqu.C("closed_at"),
		goqu.C("created_at"),
		goqu.C("partial_closed_by"),
		goqu.C("closed_by"),
		goqu.C("remote_synced"),
	).From(TableReports)
}

func scanReport(row interface {
	Scan(dest ...any) error
}) (*models.Report, error) {
	var report models.Report
	if err := row.Scan(
		&report.ID,
		&report.Username,
		&report.Timetable,
		&report.PartialTickets,
		&report.PartialCash,
		&report.PartialCashReceived,
		&report.FinalTickets,
		&report.FinalCash,
		&report.FinalCashReceived,
		&report.Status,
		&report.TotalGold,
		&report.TotalGoldCash,
		&report.TotalNull,
		&report.TotalNullCash,
		&report.TotalRegular,
		&report.TotalRegularCash,
		&report.PartialClosedAt,
		&report.ClosedAt,
		&report.CreatedAt,
		&report.PartialClosedBy,
		&report.ClosedBy,
		&report.RemoteSynced,
	); err != nil {
		return nil, err
	}
	return &report, nil
}

func scanReports(rows *sql.Rows) ([]*models.Report, error) {
	var reports []*models.Report
	for rows.Next() {
		report, err := scanReport(rows)
		if err != nil {
			return nil, err
		}
		reports = append(reports, report)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return reports, nil
}
