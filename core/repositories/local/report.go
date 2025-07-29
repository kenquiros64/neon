package local

import (
	"context"
	"fmt"
	"neon/core/database/connections/embedded"
	"neon/core/models"

	"github.com/doug-martin/goqu/v9"
)

// ReportRepository implements ReportRepository
type ReportRepository struct {
	ctx context.Context
	db  *embedded.Database
}

// NewReportRepository creates a new report repository
func NewReportRepository(ctx context.Context, db *embedded.Database) *ReportRepository {
	return &ReportRepository{
		ctx: ctx,
		db:  db,
	}
}

// Add adds a report to the database and returns it with the generated ID
func (r *ReportRepository) Add(report models.Report) (*models.Report, error) {
	query := dialect.Insert(TableReports).Rows(report)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	result, err := r.db.GetDB().Exec(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to add report: %w", err)
	}

	// Get the generated ID
	generatedID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get generated ID: %w", err)
	}

	// Update the report with the generated ID
	report.ID = generatedID

	return &report, nil
}

// Update updates a report in the database
func (r *ReportRepository) Update(report models.Report) error {
	if report.ID == 0 {
		return fmt.Errorf("report id is required")
	}

	query := dialect.Update(TableReports).Set(report).Where(ColumnID.Eq(report.ID))

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return fmt.Errorf("failed to prepare query: %w", err)
	}

	_, err = r.db.GetDB().Exec(sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update report: %w", err)
	}

	return nil
}

// GetByID gets a report by id
func (r *ReportRepository) GetByID(reportID int64) (*models.Report, error) {
	query := dialect.Select(goqu.C("*")).From(TableReports).Where(ColumnID.Eq(reportID))

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	row := r.db.GetDB().QueryRow(sql, args...)

	var report models.Report
	if err := row.Scan(
		&report.ID,
		&report.Username,
		&report.Timetable,
		&report.PartialTickets,
		&report.PartialCash,
		&report.FinalCash,
		&report.Status,
		&report.TotalCash,
		&report.TotalTickets,
		&report.TotalGold,
		&report.TotalGoldCash,
		&report.TotalNull,
		&report.TotalNullCash,
		&report.TotalRegular,
		&report.TotalRegularCash,
		&report.PartialClosedAt,
		&report.ClosedAt,
		&report.CreatedAt,
	); err != nil {
		return nil, fmt.Errorf("failed to scan report: %w", err)
	}

	if err := row.Err(); err != nil {
		return nil, fmt.Errorf("failed to get report: %w", err)
	}

	return &report, nil
}

// GetOpenOrPendingReport gets an open or pending report
func (r *ReportRepository) GetOpenOrPendingReport() (*models.Report, error) {
	query := dialect.Select(goqu.C("*")).From(TableReports).Where(
		ColumnStatus.Eq(true),
	).Limit(1)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	row := r.db.GetDB().QueryRow(sql, args...)

	var report models.Report
	if err := row.Scan(
		&report.ID,
		&report.Username,
		&report.Timetable,
		&report.PartialTickets,
		&report.PartialCash,
		&report.FinalCash,
		&report.Status,
		&report.TotalCash,
		&report.TotalTickets,
		&report.TotalGold,
		&report.TotalGoldCash,
		&report.TotalNull,
		&report.TotalNullCash,
		&report.TotalRegular,
		&report.TotalRegularCash,
		&report.PartialClosedAt,
		&report.ClosedAt,
		&report.CreatedAt,
	); err != nil {
		return nil, err
	}

	return &report, nil
}

// GetLatestReportsByUsername gets the latest 2 closed reports for a specific username
func (r *ReportRepository) GetLatestReportsByUsername(username string) ([]*models.Report, error) {
	query := dialect.Select(goqu.C("*")).From(TableReports).Where(
		goqu.And(
			goqu.C("username").Eq(username),
			goqu.C("status").Eq(false), // Only closed reports
		),
	).Order(goqu.C("created_at").Desc()).Limit(2)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	rows, err := r.db.GetDB().Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query reports: %w", err)
	}
	defer rows.Close()

	var reports []*models.Report
	for rows.Next() {
		var report models.Report
		if err := rows.Scan(
			&report.ID,
			&report.Username,
			&report.Timetable,
			&report.PartialTickets,
			&report.PartialCash,
			&report.FinalCash,
			&report.Status,
			&report.TotalCash,
			&report.TotalTickets,
			&report.TotalGold,
			&report.TotalGoldCash,
			&report.TotalNull,
			&report.TotalNullCash,
			&report.TotalRegular,
			&report.TotalRegularCash,
			&report.PartialClosedAt,
			&report.ClosedAt,
			&report.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan report: %w", err)
		}
		reports = append(reports, &report)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate reports: %w", err)
	}

	return reports, nil
}
