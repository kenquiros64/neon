// Package remote
package remote

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"neon/core/constants"
	"neon/core/database/connections/mongodb"
	"neon/core/models"
)

// UserRepository implements UserRepository for remote MongoDB
type UserRepository struct {
	collection *mongo.Collection
}

// NewUserRepository creates a new remote user repository
func NewUserRepository(db *mongodb.MongoDB) *UserRepository {
	return &UserRepository{
		collection: db.GetCollection(constants.UserCollection),
	}
}

// Create creates a new user in MongoDB
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	now := time.Now().Format(time.RFC3339)
	user.CreatedAt = now
	user.UpdatedAt = &now

	_, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// All returns all users from MongoDB
func (r *UserRepository) All(ctx context.Context) ([]models.User, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	defer cursor.Close(ctx)

	var users []models.User
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return nil, fmt.Errorf("failed to decode user: %w", err)
		}
		users = append(users, user)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return users, nil
}
