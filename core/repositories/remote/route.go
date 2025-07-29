package remote

import (
	"context"
	"fmt"
	"neon/core/constants"
	"neon/core/database/connections/mongodb"
	"neon/core/helpers"
	"neon/core/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// RouteRepository implements RouteRepository for remote
type RouteRepository struct {
	collection *mongo.Collection
}

// NewRouteRepository creates a new remote route repository
func NewRouteRepository(db *mongodb.MongoDB) *RouteRepository {
	return &RouteRepository{
		collection: db.GetCollection(constants.RouteCollection),
	}
}

// All returns all routes from MongoDB
func (r *RouteRepository) All(ctx context.Context) ([]models.Route, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to list routes: %w", err)
	}

	defer cursor.Close(ctx)

	var routes []models.Route
	for cursor.Next(ctx) {
		var route models.Route
		if err := cursor.Decode(&route); err != nil {
			return nil, fmt.Errorf("failed to decode route: %w", err)
		}

		if route.IsEmpty() {
			return nil, helpers.ErrRouteIsEmpty
		}

		routes = append(routes, route)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return routes, nil
}

// Create creates a new route in MongoDB
func (r *RouteRepository) Create(ctx context.Context, route *models.Route) error {
	if route == nil {
		return fmt.Errorf("route is nil")
	}

	route.ID = bson.NewObjectID()
	_, err := r.collection.InsertOne(ctx, route)
	if err != nil {
		return fmt.Errorf("failed to create route: %w", err)
	}

	return nil
}

// Update updates a route in MongoDB
func (r *RouteRepository) Update(ctx context.Context, route *models.Route) error {
	if route == nil {
		return fmt.Errorf("route is nil")
	}

	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": route.ID}, bson.M{"$set": route})
	if err != nil {
		return fmt.Errorf("failed to update route: %w", err)
	}

	return nil
}

// Delete deletes a route in MongoDB
func (r *RouteRepository) Delete(ctx context.Context, route *models.Route) error {
	if route == nil {
		return fmt.Errorf("route is nil")
	}

	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": route.ID})
	if err != nil {
		return fmt.Errorf("failed to delete route: %w", err)
	}

	return nil
}
