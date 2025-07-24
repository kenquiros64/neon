// Package services provides authentication services for the neon application
package services

import (
	"context"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/helpers"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"golang.org/x/crypto/bcrypt"
)

// AuthService provides authentication services for the neon application
type AuthService struct {
	ctx      context.Context
	remoteDB *mongodb.MongoDB
	localDB  *embedded.CloverDB
}

// NewAuthService creates a new AuthService
func NewAuthService(remoteDB *mongodb.MongoDB, localDB *embedded.CloverDB) *AuthService {
	return &AuthService{
		remoteDB: remoteDB,
		localDB:  localDB,
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
		return nil, err
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return nil, helpers.ErrUserInvalidPassword
		}
		return nil, err
	}
	return user, nil
}

// Register creates a new user
func (a *AuthService) Register(user *models.User) error {
	if user.Username == "" || user.Password == "" || user.Name == "" {
		return helpers.ErrInvalidRequest
	}

	remoteRepo := remote.NewUserRepository(a.remoteDB)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)

	return remoteRepo.Create(a.ctx, user)
}
