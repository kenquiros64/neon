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

// RouteRepository implements RouteRepository for SQLite using goqu
type RouteRepository struct {
	collection string
	db         *embedded.CloverDB
}

// NewRouteRepository creates a new route repository with goqu
func NewRouteRepository(db *embedded.CloverDB) *RouteRepository {
	return &RouteRepository{
		collection: constants.RouteCollection,
		db:         db,
	}
}

// All returns all routes from the database
func (r *RouteRepository) All() ([]models.Route, error) {
	query := q.NewQuery(r.collection)

	docs, err := r.db.GetDB().FindAll(query)
	if err != nil {
		return nil, fmt.Errorf("failed to find routes: %w", err)
	}

	routes := make([]models.Route, len(docs))
	for i, doc := range docs {
		var route models.Route

		if err = doc.Unmarshal(&route); err != nil {
			return nil, fmt.Errorf("failed to unmarshal route: %w", err)
		}
		routes[i] = route
	}

	return routes, nil
}

// Create creates a new route in the database
func (r *RouteRepository) Create(route *models.Route) error {
	doc, err := helpers.MarshalAsCloverDocument(route)
	if err != nil {
		return fmt.Errorf("failed to marshal route: %w", err)
	}

	_, err = r.db.GetDB().InsertOne(r.collection, doc)
	if err != nil {
		return fmt.Errorf("failed to insert route: %w", err)
	}

	return nil
}

// BulkCreate creates multiple routes in the database
func (r *RouteRepository) BulkCreate(routes []models.Route) error {
	docs := make([]*c.Document, len(routes))

	for i, route := range routes {
		doc, err := helpers.MarshalAsCloverDocument(route)
		if err != nil {
			return fmt.Errorf("failed to marshal route: %w", err)
		}
		docs[i] = doc
	}

	if err := r.db.GetDB().Insert(r.collection, docs...); err != nil {
		return fmt.Errorf("failed to insert routes: %w", err)
	}

	return nil
}

// Clear clears all routes from the database
func (r *RouteRepository) Clear() error {
	return r.db.GetDB().Delete(q.NewQuery(r.collection))
}
