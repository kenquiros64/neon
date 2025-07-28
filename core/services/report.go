package services

import (
	"context"
	"database/sql"
	"errors"
	"neon/core/database/connections/embedded"
	"neon/core/helpers"
	"neon/core/helpers/enums"
	"neon/core/models"
	"neon/core/repositories/local"
	"time"

	"go.uber.org/zap"
)

// ReportService is a service for reports
type ReportService struct {
	ctx     context.Context
	localDB *embedded.Database
}

// NewReportService creates a new report service
func NewReportService(localDB *embedded.Database) *ReportService {
	return &ReportService{localDB: localDB}
}

// startup starts the report service
func (r *ReportService) startup(ctx context.Context) {
	r.ctx = ctx
}

// StartReport starts a new report
func (r *ReportService) StartReport(username string, timetable string) (*models.Report, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)

	now := time.Now().Format(time.RFC3339)
	report := models.Report{
		Username:  username,
		Timetable: enums.Timetable(timetable),
		Status:    true,
		CreatedAt: &now,
	}

	output, err := repository.Add(report)
	if err != nil {
		zap.L().Error("failed to add report", zap.Error(err))
		return nil, err
	}

	return output, nil
}

// CheckIfThereIsAnOpenOrPendingReport checks if a report is open or pending (cash not verified)
func (r *ReportService) CheckIfThereIsAnOpenOrPendingReport() (*models.Report, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)

	report, err := repository.GetOpenOrPendingReport()
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, helpers.ErrRowNotFound
		}
		zap.L().Error("failed to get open or pending report", zap.Error(err))
		return nil, err
	}

	if report == nil {
		return nil, nil
	}

	return report, nil
}

// PartialCloseReport closes a report
func (r *ReportService) PartialCloseReport(
	reportID int64,
	cash int,
) (*models.Report, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)

	report, err := repository.GetByID(reportID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, helpers.ErrRowNotFound
		}
		zap.L().Error("failed to get report", zap.Error(err))
		return nil, err
	}

	now := time.Now().Format(time.RFC3339)
	report.PartialClosedAt = &now

	if err := repository.Update(*report); err != nil {
		zap.L().Error("failed to update report", zap.Error(err))
		return nil, err
	}

	return report, nil
}

// TotalCloseReport closes a report
func (r *ReportService) TotalCloseReport(
	reportID int64,
	cash int,
) (*models.Report, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)

	report, err := repository.GetByID(reportID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, helpers.ErrRowNotFound
		}
		zap.L().Error("failed to get report", zap.Error(err))
		return nil, err
	}

	now := time.Now().Format(time.RFC3339)
	report.ClosedAt = &now
	report.Status = false

	if err := repository.Update(*report); err != nil {
		zap.L().Error("failed to update report", zap.Error(err))
		return nil, err
	}

	return report, nil
}
