// Package local
package local

import (
	"fmt"
	"neon/core/constants"
	"neon/core/database/connections/embedded"
	"neon/core/helpers"
	"neon/core/models"

	c "github.com/ostafen/clover/v2/document"
	q "github.com/ostafen/clover/v2/query"
)

// UserRepository implements UserRepository for CloverDB
type UserRepository struct {
	collection string
	db         *embedded.CloverDB
}

// NewUserRepository creates a new User repository with CloverDB
func NewUserRepository(db *embedded.CloverDB) *UserRepository {
	return &UserRepository{
		collection: constants.UserCollection,
		db:         db,
	}
}

// All returns all users from the database
func (r *UserRepository) All() ([]models.User, error) {
	query := q.NewQuery(r.collection)

	docs, err := r.db.GetDB().FindAll(query)
	if err != nil {
		return nil, fmt.Errorf("failed to find users: %w", err)
	}

	users := make([]models.User, len(docs))
	for i, doc := range docs {
		var user models.User
		err = doc.Unmarshal(&user)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal user: %w", err)
		}
		users[i] = user
	}

	return users, nil
}

// Insert inserts a user in the database
func (r *UserRepository) Insert(user *models.User) error {
	doc, err := helpers.MarshalAsCloverDocument(user)
	if err != nil {
		return fmt.Errorf("failed to marshal user: %w", err)
	}

	_, err = r.db.GetDB().InsertOne(r.collection, doc)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}

	return nil
}

// BulkCreate creates multiple users in the database
func (r *UserRepository) BulkCreate(users []models.User) error {
	docs := make([]*c.Document, len(users))

	for i, user := range users {
		doc, err := helpers.MarshalAsCloverDocument(user)
		if err != nil {
			return fmt.Errorf("failed to marshal user: %w", err)
		}

		docs[i] = doc
	}

	if err := r.db.GetDB().Insert(r.collection, docs...); err != nil {
		return fmt.Errorf("failed to insert users: %w", err)
	}

	return nil
}

// FindByUsername finds a user by username
func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	doc, err := r.db.GetDB().FindFirst(q.NewQuery(r.collection).Where(q.Field(ColumnUsername).Eq(username)))
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}
	if doc == nil {
		return nil, helpers.ErrUserNotFound
	}

	var user models.User
	err = doc.Unmarshal(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %w", err)
	}

	return &user, nil
}

// Clear clears all routes from the database
func (r *UserRepository) Clear() error {
	if err := r.db.GetDB().Delete(q.NewQuery(r.collection)); err != nil {
		return fmt.Errorf("failed to delete users: %w", err)
	}

	return nil
}
