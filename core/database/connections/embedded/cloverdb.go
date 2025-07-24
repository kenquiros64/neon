// Package embedded provides an embedded database for the application
package embedded

import (
	"context"
	"fmt"
	"log"
	"sync"

	"neon/core/config"
	"neon/core/constants"

	c "github.com/ostafen/clover/v2"
)

// CloverDB represents a CloverDB database connection
type CloverDB struct {
	db        *c.DB
	config    *config.CloverDBConfig
	connected bool
	mu        sync.RWMutex
}

// NewCloverDB creates a new CloverDB connection instance
func NewCloverDB(cfg *config.CloverDBConfig) *CloverDB {
	return &CloverDB{
		config: cfg,
	}
}

// Connect establishes a connection to CloverDB
func (d *CloverDB) Connect(ctx context.Context) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	if d.connected {
		return nil
	}

	// Open database connection
	db, err := c.Open(d.config.FilePath)
	if err != nil {
		return fmt.Errorf("failed to open CloverDB database: %w", err)
	}

	d.db = db
	d.connected = true

	d.initCollections()

	return nil
}

// Close closes the CloverDB connection
func (d *CloverDB) Close() error {
	d.mu.Lock()
	defer d.mu.Unlock()

	if d.db != nil {
		return d.db.Close()
	}

	return nil
}

// IsConnected checks if the CloverDB connection is established
func (d *CloverDB) IsConnected() bool {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.connected
}

// GetDB returns the underlying CloverDB database connection
func (d *CloverDB) GetDB() *c.DB {
	d.mu.RLock()
	defer d.mu.RUnlock()
	return d.db
}

func (d *CloverDB) initCollections() {
	collections := []string{
		constants.RouteCollection,
		constants.UserCollection,
		constants.CountCollection,
	}

	for _, collection := range collections {
		err := d.db.CreateCollection(collection)
		if err != nil {
			if err == c.ErrCollectionExist {
				continue
			}

			log.Fatalf("failed to create collection: %v", err)
		}
	}
}
