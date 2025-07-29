package services

import (
	"context"
	"errors"
	"fmt"
	"neon/core/config"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/helpers"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
)

// SyncService provides synchronization services
type SyncService struct {
	ctx     context.Context
	localDB *embedded.CloverDB
}

// NewSyncService creates a new SyncService
func NewSyncService(localDB *embedded.CloverDB) *SyncService {
	return &SyncService{
		localDB: localDB,
	}
}

func (s *SyncService) startup(ctx context.Context) {
	s.ctx = ctx
}

// SyncRoutes syncs routes from the remote repository to the local repository
func (s *SyncService) SyncRoutes() error {
	// Check internet connectivity before attempting sync
	if err := helpers.CheckInternetConnection(); err != nil {
		zap.L().Error("no internet connection available for sync", zap.Error(err))
		return err
	}

	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(s.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()

	remoteRepo := remote.NewRouteRepository(remotedb)
	localRepo := local.NewRouteRepository(s.localDB)

	routes, err := remoteRepo.All(s.ctx)
	if err != nil {
		if errors.Is(err, helpers.ErrRouteIsEmpty) {
			return err
		}
		zap.L().Error("failed to get routes from remote repository", zap.Error(err))
		return fmt.Errorf("failed to get routes from remote repository: %w", err)
	}

	if err := localRepo.Clear(); err != nil {
		zap.L().Error("failed to clear local routes before sync", zap.Error(err))
		return fmt.Errorf("failed to clear local routes before sync: %w", err)
	}

	if err := localRepo.BulkCreate(routes); err != nil {
		zap.L().Error("failed to bulk create routes", zap.Error(err))
		return err
	}

	return nil
}

// SyncUsers syncs users from the remote repository to the local repository
func (s *SyncService) SyncUsers() error {
	// Check internet connectivity before attempting sync
	if err := helpers.CheckInternetConnection(); err != nil {
		zap.L().Error("no internet connection available for sync", zap.Error(err))
		return err
	}

	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(s.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewUserRepository(remotedb)
	localRepo := local.NewUserRepository(s.localDB)

	users, err := remoteRepo.All(s.ctx)
	if err != nil {
		zap.L().Error("failed to get users from remote repository", zap.Error(err))
		return fmt.Errorf("failed to get users from remote repository: %w", err)
	}

	if err := localRepo.Clear(); err != nil {
		zap.L().Error("failed to clear local users before sync", zap.Error(err))
		return fmt.Errorf("failed to clear local users before sync: %w", err)
	}

	if err := localRepo.BulkCreate(users); err != nil {
		zap.L().Error("failed to bulk create users", zap.Error(err))
		return fmt.Errorf("failed to bulk create users: %w", err)
	}

	return nil
}
