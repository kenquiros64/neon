package services

import (
	"context"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"
	"neon/core/models"
	"neon/core/repositories/local"
	"neon/core/repositories/remote"
)

// RouteService is a service for routes
type RouteService struct {
	ctx      context.Context
	remoteDB *mongodb.MongoDB
	localDB  *embedded.CloverDB
}

// NewRouteService creates a new route service
func NewRouteService(remoteDB *mongodb.MongoDB, localDB *embedded.CloverDB) *RouteService {
	return &RouteService{remoteDB: remoteDB, localDB: localDB}
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
		return nil, err
	}

	return routes, nil
}

// AddRoute adds a route
func (r *RouteService) AddRoute(route *models.Route) error {
	remoteRepo := remote.NewRouteRepository(r.remoteDB)

	if err := remoteRepo.Create(r.ctx, route); err != nil {
		return err
	}

	syncService := NewSyncService(r.remoteDB, r.localDB)
	if err := syncService.SyncRoutes(); err != nil {
		return err
	}

	return nil
}

// UpdateRoute updates a route
func (r *RouteService) UpdateRoute(route *models.Route) error {
	remoteRepo := remote.NewRouteRepository(r.remoteDB)

	if err := remoteRepo.Update(r.ctx, route); err != nil {
		return err
	}

	syncService := NewSyncService(r.remoteDB, r.localDB)
	if err := syncService.SyncRoutes(); err != nil {
		return err
	}

	return nil
}

// DeleteRoute deletes a route
func (r *RouteService) DeleteRoute(route *models.Route) error {
	remoteRepo := remote.NewRouteRepository(r.remoteDB)
	if err := remoteRepo.Delete(r.ctx, route); err != nil {
		return err
	}

	syncService := NewSyncService(r.remoteDB, r.localDB)
	if err := syncService.SyncRoutes(); err != nil {
		return err
	}

	return nil
}
