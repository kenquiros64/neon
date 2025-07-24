package local

import (
	"context"
	"fmt"
	"neon/core/database/connections/embedded"
	"neon/core/models"
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

// Add adds a report to the database
func (r *ReportRepository) Add(report models.Report) error {
	query := dialect.Insert(TableReports).Rows(report)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return fmt.Errorf("failed to prepare query: %w", err)
	}

	_, err = r.db.GetDB().Exec(sql, args...)
	if err != nil {
		return fmt.Errorf("failed to add report: %w", err)
	}

	return nil
}

// Update updates a report in the database
func (r *ReportRepository) Update(report models.Report) error {
	if report.ID == "" {
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
