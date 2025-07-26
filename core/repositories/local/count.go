package local

import (
	"encoding/json"
	"fmt"
	"neon/core/constants"
	"neon/core/database/connections/embedded"
	"neon/core/helpers"
	"neon/core/models"

	"github.com/ostafen/clover/v2/document"
	q "github.com/ostafen/clover/v2/query"
)

// CountRepository implements CountRepository for CloverDB
type CountRepository struct {
	collection string
	db         *embedded.CloverDB
}

// NewCountRepository creates a new Count repository with CloverDB
func NewCountRepository(db *embedded.CloverDB) *CountRepository {
	return &CountRepository{
		collection: constants.CountCollection,
		db:         db,
	}
}

// Insert inserts a count
func (c *CountRepository) Insert(count models.Count) error {
	doc, err := helpers.MarshalAsCloverDocument(count)
	if err != nil {
		return fmt.Errorf("failed to marshal count: %w", err)
	}

	if _, err := c.db.GetDB().InsertOne(c.collection, doc); err != nil {
		return fmt.Errorf("failed to insert count: %w", err)
	}

	return nil
}

// Update updates a count
func (c *CountRepository) Update(count models.Count) error {
	doc, err := helpers.MarshalAsCloverDocument(count)
	if err != nil {
		return fmt.Errorf("failed to marshal count: %w", err)
	}

	if err := c.db.GetDB().Update(
		q.NewQuery(c.collection).Where(q.Field(ColumnKey).Eq(count.Key)),
		doc.AsMap(),
	); err != nil {
		return fmt.Errorf("failed to update count: %w", err)
	}

	return nil
}

// FindByKey finds a count for a given key
func (c *CountRepository) FindByKey(key string) (*models.Count, error) {
	query := q.NewQuery(c.collection).Where(q.Field(ColumnKey).Eq(key))
	doc, err := c.db.GetDB().FindFirst(query)
	if err != nil {
		return nil, fmt.Errorf("failed to find count: %w", err)
	}
	if doc == nil {
		return nil, nil
	}

	bytes, err := json.Marshal(doc.AsMap())
	if err != nil {
		return nil, fmt.Errorf("failed to marshal document to JSON: %w", err)
	}

	var count models.Count
	if err := json.Unmarshal(bytes, &count); err != nil {
		return nil, fmt.Errorf("failed to unmarshal count from JSON: %w", err)
	}

	return &count, nil
}

// FindByDate finds all counts for a given date
func (c *CountRepository) FindByDate(date string) ([]models.Count, error) {
	query := q.NewQuery(c.collection).Where(q.Field(ColumnLastReset).Eq(date))
	docs, err := c.db.GetDB().FindAll(query)
	if err != nil {
		return nil, fmt.Errorf("failed to find counts: %w", err)
	}

	return unmarshalDocs(docs)
}

// Clear clears all routes from the database
func (c *CountRepository) Clear() error {
	if err := c.db.GetDB().Delete(q.NewQuery(c.collection)); err != nil {
		return fmt.Errorf("failed to delete users: %w", err)
	}

	return nil
}

// unmarshalDocs unmarshals a clover document into a count
func unmarshalDocs(docs []*document.Document) ([]models.Count, error) {
	counts := make([]models.Count, len(docs))
	for i, doc := range docs {
		bytes, err := json.Marshal(doc.AsMap())
		if err != nil {
			return nil, fmt.Errorf("failed to marshal document to JSON: %w", err)
		}

		var count models.Count
		if err := json.Unmarshal(bytes, &count); err != nil {
			return nil, fmt.Errorf("failed to unmarshal count from JSON: %w", err)
		}
		counts[i] = count
	}

	return counts, nil
}
