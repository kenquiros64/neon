package local

import (
	"context"
	"fmt"
	"neon/core/database/embedded"
	"neon/core/models"

	"github.com/doug-martin/goqu/v9"
)

// ReportRepository implements ReportRepository
type ReportRepository struct {
	ctx context.Context
	db  *embedded.SQLite
}

// NewReportRepository creates a new report repository
func NewReportRepository(ctx context.Context, db *embedded.SQLite) *ReportRepository {
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

	generatedID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get generated ID: %w", err)
	}

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
	query := reportSelect().Where(ColumnID.Eq(reportID))

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	row := r.db.GetDB().QueryRow(sql, args...)
	report, err := scanReport(row)
	if err != nil {
		return nil, fmt.Errorf("failed to scan report: %w", err)
	}

	return report, nil
}

// GetOpenOrPendingReport gets an open or pending report
func (r *ReportRepository) GetOpenOrPendingReport() (*models.Report, error) {
	query := reportSelect().Where(ColumnStatus.Eq(true)).Limit(1)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	row := r.db.GetDB().QueryRow(sql, args...)
	return scanReport(row)
}

// GetLatestReportsByUsername gets the latest closed reports for a user
func (r *ReportRepository) GetLatestReportsByUsername(username string) ([]*models.Report, error) {
	query := reportSelect().Where(
		goqu.And(
			goqu.C("username").Eq(username),
			goqu.C("status").Eq(false),
		),
	).Order(goqu.C("created_at").Desc()).Limit(10)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	rows, err := r.db.GetDB().Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query reports: %w", err)
	}
	defer rows.Close()

	return scanReports(rows)
}

// GetPendingRemoteSync returns reports that were closed but not yet synced to remote MySQL.
func (r *ReportRepository) GetPendingRemoteSync() ([]*models.Report, error) {
	query := reportSelect().Where(
		goqu.And(
			goqu.C("remote_synced").Eq(0),
			goqu.Or(
				goqu.C("partial_closed_at").IsNotNull(),
				goqu.C("closed_at").IsNotNull(),
			),
		),
	).Order(goqu.C("id").Asc())

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	rows, err := r.db.GetDB().Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query pending sync reports: %w", err)
	}
	defer rows.Close()

	return scanReports(rows)
}
