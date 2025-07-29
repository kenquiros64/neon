package services

import (
	"context"
	"neon/core/config"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"

	"go.uber.org/zap"
)

// RouteService is a service for routes
type RouteService struct {
	ctx     context.Context
	localDB *embedded.CloverDB
}

// NewRouteService creates a new route service
func NewRouteService(localDB *embedded.CloverDB) *RouteService {
	return &RouteService{localDB: localDB}
}

// startup starts the route service
func (r *RouteService) startup(ctx context.Context) {
	r.ctx = ctx
}

// GetRoutes gets all routes
func (r *RouteService) GetRoutes() ([]models.Route, error) {
	localRepo := local.NewRouteRepository(r.localDB)

	routes, err := localRepo.All()
	if err != nil {
		zap.L().Error("failed to get routes", zap.Error(err))
		return nil, err
	}

	return routes, nil
}

// AddRoute adds a route
func (r *RouteService) AddRoute(route *models.Route) error {
	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(r.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewRouteRepository(remotedb)

	if err := remoteRepo.Create(r.ctx, route); err != nil {
		zap.L().Error("failed to create route", zap.Error(err))
		return err
	}

	return nil
}

// UpdateRoute updates a route
func (r *RouteService) UpdateRoute(route *models.Route) error {
	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(r.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewRouteRepository(remotedb)

	if err := remoteRepo.Update(r.ctx, route); err != nil {
		zap.L().Error("failed to update route", zap.Error(err))
		return err
	}

	return nil
}

// DeleteRoute deletes a route
func (r *RouteService) DeleteRoute(route *models.Route) error {
	remotedb := mongodb.NewMongoDB(config.GetMongoDBConfig())
	if err := remotedb.Connect(r.ctx); err != nil {
		zap.L().Error("failed to connect to remote database", zap.Error(err))
		return err
	}
	defer remotedb.Close()
	remoteRepo := remote.NewRouteRepository(remotedb)

	if err := remoteRepo.Delete(r.ctx, route); err != nil {
		zap.L().Error("failed to delete route", zap.Error(err))
		return err
	}

	return nil
}
