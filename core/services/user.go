package services

import (
	"context"
	"neon/core/config"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/models"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
)

// UserService is a service for users
type UserService struct {
	ctx     context.Context
	localDB *embedded.CloverDB
}

// NewUserService creates a new user service
func NewUserService(localDB *embedded.CloverDB) *UserService {
	return &UserService{localDB: localDB}
}

// startup starts the user service
func (u *UserService) startup(ctx context.Context) {
	u.ctx = ctx
}

// AddUser adds a user
func (u *UserService) AddUser(user *models.User) error {
	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(u.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewUserRepository(remotedb)

	if err := remoteRepo.Create(u.ctx, user); err != nil {
		zap.L().Error("failed to create user", zap.Error(err))
		return err
	}

	return nil
}
