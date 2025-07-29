// Package services provides authentication services for the neon application
package services

import (
	"context"
	"neon/core/config"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/helpers"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// AuthService provides authentication services for the neon application
type AuthService struct {
	ctx     context.Context
	localDB *embedded.CloverDB
}

// NewAuthService creates a new AuthService
func NewAuthService(localDB *embedded.CloverDB) *AuthService {
	return &AuthService{
		localDB: localDB,
	}
}

func (a *AuthService) startup(ctx context.Context) {
	a.ctx = ctx
}

// Login authenticates a user and returns a token
func (a *AuthService) Login(username string, password string) (*models.User, error) {
	localRepo := local.NewUserRepository(a.localDB)

	user, err := localRepo.FindByUsername(username)
	if err != nil {
		zap.L().Error("failed to find user by username", zap.Error(err))
		return nil, err
	}
	if user == nil {
		return nil, helpers.ErrUserNotFound
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return nil, helpers.ErrUserInvalidPassword
		}
		zap.L().Error("failed to compare hash and password", zap.Error(err))
		return nil, err
	}
	return user, nil
}

// Register creates a new user
func (a *AuthService) Register(user *models.User) error {
	if user.Username == "" || user.Password == "" || user.Name == "" {
		return helpers.ErrInvalidRequest
	}

	remotedb := mongodb.NewMongoDB(config.DefaultMongoDBConfig())
	if err := remotedb.Connect(a.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()

	remoteRepo := remote.NewUserRepository(remotedb)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		zap.L().Error("failed to generate password hash", zap.Error(err))
		return err
	}

	user.Password = string(hashedPassword)

	return remoteRepo.Create(a.ctx, user)
}
