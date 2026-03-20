package services

import (
	"context"
	"database/sql"
	"errors"
	"neon/core/config"
	"neon/core/database/embedded"
	remotedb "neon/core/database/remote"
	"neon/core/helpers"
	"neon/core/helpers/enums"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"
	"time"

	"go.uber.org/zap"
)

// ReportService is a service for reports
type ReportService struct {
	ctx     context.Context
	localDB *embedded.SQLite
}

// NewReportService creates a new report service
func NewReportService(localDB *embedded.SQLite) *ReportService {
	return &ReportService{localDB: localDB}
}

// startup starts the report service
func (r *ReportService) startup(ctx context.Context) {
	r.ctx = ctx
	go r.runStartupRemoteSync()
}

// runStartupRemoteSync pushes any locally closed reports that never reached remote MySQL (non-blocking for UI).
func (r *ReportService) runStartupRemoteSync() {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	n, err := r.SyncPendingReportsToRemote(ctx)
	if err != nil {
		zap.L().Warn("startup report sync finished with errors", zap.Int("synced", n), zap.Error(err))
		return
	}
	if n > 0 {
		zap.L().Info("startup report sync completed", zap.Int("synced", n))
	}
}

// pushReportToMySQL attempts to upsert the report to remote MySQL. On failure, caller should set RemoteSynced locally.
func (r *ReportService) pushReportToMySQL(ctx context.Context, report *models.Report) error {
	cfg, err := config.LoadMySQLDBSyncConfig()
	if err != nil {
		return err
	}
	db := remotedb.NewMySQLReportDB(cfg)
	if err := db.Connect(ctx); err != nil {
		return err
	}
	defer db.Close()

	repo := remote.NewReportRepository(db.DB())
	return repo.UpsertReport(ctx, report)
}

// persistRemoteSyncFlag updates only the remote_synced column state after a push attempt.
func (r *ReportService) persistRemoteSyncFlag(report *models.Report, synced bool) error {
	repository := local.NewReportRepository(r.ctx, r.localDB)
	report.RemoteSynced = synced
	return repository.Update(*report)
}

// trySyncAfterClose saves to remote MySQL after a close; if offline, misconfigured, or DB errors, keeps report local with remote_synced=false.
func (r *ReportService) trySyncAfterClose(report *models.Report) {
	if report == nil {
		return
	}
	ctx, cancel := context.WithTimeout(r.ctx, 45*time.Second)
	defer cancel()

	if err := r.pushReportToMySQL(ctx, report); err != nil {
		zap.L().Warn("report not synced to MySQL; will retry on next app start",
			zap.Int64("report_id", report.ID),
			zap.Error(err),
		)
		if err := r.persistRemoteSyncFlag(report, false); err != nil {
			zap.L().Error("failed to persist remote_synced=false", zap.Error(err))
		}
		return
	}

	if err := r.persistRemoteSyncFlag(report, true); err != nil {
		zap.L().Error("failed to persist remote_synced=true after successful MySQL upsert", zap.Error(err))
	}
}

// SyncPendingReportsToRemote uploads all closed-but-unsynced reports. Returns count successfully synced.
func (r *ReportService) SyncPendingReportsToRemote(ctx context.Context) (int, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)
	pending, err := repository.GetPendingRemoteSync()
	if err != nil {
		return 0, err
	}
	if len(pending) == 0 {
		return 0, nil
	}

	cfg, err := config.LoadMySQLDBSyncConfig()
	if err != nil {
		return 0, err
	}
	db := remotedb.NewMySQLReportDB(cfg)
	if err := db.Connect(ctx); err != nil {
		return 0, err
	}
	defer db.Close()

	remoteRepo := remote.NewReportRepository(db.DB())
	synced := 0
	for _, rep := range pending {
		if err := remoteRepo.UpsertReport(ctx, rep); err != nil {
			zap.L().Warn("pending report sync failed", zap.Int64("report_id", rep.ID), zap.Error(err))
			continue
		}
		rep.RemoteSynced = true
		if err := repository.Update(*rep); err != nil {
			zap.L().Error("failed to mark report synced locally", zap.Int64("report_id", rep.ID), zap.Error(err))
			continue
		}
		synced++
	}
	return synced, nil
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

// PartialCloseReport closes a report partially (records cash counted, ticket count, and who closed)
func (r *ReportService) PartialCloseReport(
	reportID int64,
	cash int,
	closedByUsername *string,
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
	report.PartialCashReceived = cash
	report.PartialClosedBy = closedByUsername

	if err := repository.Update(*report); err != nil {
		zap.L().Error("failed to update report", zap.Error(err))
		return nil, err
	}

	r.trySyncAfterClose(report)

	return report, nil
}

// TotalCloseReport closes a report totally (records final cash counted and who closed)
func (r *ReportService) TotalCloseReport(
	reportID int64,
	cash int,
	closedByUsername *string,
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
	report.FinalCashReceived = cash
	report.ClosedBy = closedByUsername

	if err := repository.Update(*report); err != nil {
		zap.L().Error("failed to update report", zap.Error(err))
		return nil, err
	}

	r.trySyncAfterClose(report)

	return report, nil
}

// GetLatestReportsByUsername gets the latest 5 closed reports for a specific user
func (r *ReportService) GetLatestReportsByUsername(username string) ([]*models.Report, error) {
	repository := local.NewReportRepository(r.ctx, r.localDB)

	reports, err := repository.GetLatestReportsByUsername(username)
	if err != nil {
		zap.L().Error("failed to get latest reports", zap.Error(err))
		return nil, err
	}

	return reports, nil
}
