package services

import (
	"context"
	"fmt"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
)

// SyncService provides synchronization services
type SyncService struct {
	ctx      context.Context
	remoteDB *mongodb.MongoDB
	localDB  *embedded.CloverDB
}

// NewSyncService creates a new SyncService
func NewSyncService(remoteDB *mongodb.MongoDB, localDB *embedded.CloverDB) *SyncService {
	return &SyncService{
		remoteDB: remoteDB,
		localDB:  localDB,
	}
}

func (s *SyncService) startup(ctx context.Context) {
	s.ctx = ctx
}

// SyncRoutes syncs routes from the remote repository to the local repository
func (s *SyncService) SyncRoutes() error {
	remoteRepo := remote.NewRouteRepository(s.remoteDB)
	localRepo := local.NewRouteRepository(s.localDB)

	routes, err := remoteRepo.All(s.ctx)
	if err != nil {
		return fmt.Errorf("failed to get routes from remote repository: %w", err)
	}

	if err := localRepo.Clear(); err != nil {
		return fmt.Errorf("failed to clear local routes before sync: %w", err)
	}

	if err := localRepo.BulkCreate(routes); err != nil {
		return err
	}

	return nil
}

// SyncUsers syncs users from the remote repository to the local repository
func (s *SyncService) SyncUsers() error {
	remoteRepo := remote.NewUserRepository(s.remoteDB)
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
