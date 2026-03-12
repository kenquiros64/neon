package services

import (
	"context"
	"fmt"
	"neon/core/config"
	"neon/core/database/embedded"
	remotedb "neon/core/database/remote"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// UserService is a service for users
type UserService struct {
	ctx         context.Context
	localDB     *embedded.CloverDB
	syncService *SyncService
}

// NewUserService creates a new user service
func NewUserService(localDB *embedded.CloverDB, syncService *SyncService) *UserService {
	return &UserService{localDB: localDB, syncService: syncService}
}

// startup starts the user service
func (u *UserService) startup(ctx context.Context) {
	u.ctx = ctx
}

// AddUser adds a user (remote then syncs to local)
func (u *UserService) AddUser(user *models.User) error {
	if user == nil || user.Password == "" {
		return fmt.Errorf("user or password is required")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		zap.L().Error("failed to hash password", zap.Error(err))
		return err
	}
	user.Password = string(hashedPassword)

	remotedb := remotedb.NewMongoDB(config.GetMongoDBConfig())
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

	if err := u.syncService.SyncUsers(); err != nil {
		zap.L().Error("failed to sync users after add", zap.Error(err))
		return err
	}
	return nil
}

// GetUsers returns all users from local database
func (u *UserService) GetUsers() ([]models.User, error) {
	localRepo := local.NewUserRepository(u.localDB)
	users, err := localRepo.All()
	if err != nil {
		zap.L().Error("failed to get users", zap.Error(err))
		return nil, err
	}
	return users, nil
}

// UpdateUser updates a user (remote then syncs to local)
func (u *UserService) UpdateUser(user *models.User) error {
	if user == nil {
		return fmt.Errorf("user is nil")
	}
	// If a new password was provided, hash it; otherwise keep existing (already hashed)
	if user.Password != "" {
		// Check if it looks like a bcrypt hash (admin might have left blank to keep current)
		if len(user.Password) < 60 {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if err != nil {
				zap.L().Error("failed to hash password", zap.Error(err))
				return err
			}
			user.Password = string(hashedPassword)
		}
	}

	remotedb := remotedb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(u.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewUserRepository(remotedb)

	if err := remoteRepo.Update(u.ctx, user); err != nil {
		zap.L().Error("failed to update user", zap.Error(err))
		return err
	}

	if err := u.syncService.SyncUsers(); err != nil {
		zap.L().Error("failed to sync users after update", zap.Error(err))
		return err
	}
	return nil
}

// DeleteUser deletes a user (remote then syncs to local)
func (u *UserService) DeleteUser(user *models.User) error {
	remotedb := remotedb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(u.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewUserRepository(remotedb)

	if err := remoteRepo.Delete(u.ctx, user); err != nil {
		zap.L().Error("failed to delete user", zap.Error(err))
		return err
	}

	if err := u.syncService.SyncUsers(); err != nil {
		zap.L().Error("failed to sync users after delete", zap.Error(err))
		return err
	}
	return nil
}
