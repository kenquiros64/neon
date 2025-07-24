package services

import (
	"context"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/models"
	"neon/core/repositories/remote"
)

// UserService is a service for users
type UserService struct {
	ctx      context.Context
	localDB  *embedded.CloverDB
	remoteDB *mongodb.MongoDB
}

// NewUserService creates a new user service
func NewUserService(localDB *embedded.CloverDB, remoteDB *mongodb.MongoDB) *UserService {
	return &UserService{localDB: localDB, remoteDB: remoteDB}
}

// startup starts the user service
func (u *UserService) startup(ctx context.Context) {
	u.ctx = ctx
}

// AddUser adds a user
func (u *UserService) AddUser(user *models.User) error {
	remoteRepo := remote.NewUserRepository(u.remoteDB)

	if err := remoteRepo.Create(u.ctx, user); err != nil {
		return err
	}

	syncService := NewSyncService(u.remoteDB, u.localDB)
	if err := syncService.SyncUsers(); err != nil {
		return err
	}

	return nil
}
