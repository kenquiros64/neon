// Package mongodb provides a MongoDB database connection
package mongodb

import (
	"context"
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.uber.org/zap"

	"neon/core/config"
	"neon/core/helpers"
)

// MongoDB represents a MongoDB database connection
type MongoDB struct {
	client     *mongo.Client
	database   *mongo.Database
	config     *config.MongoDBConfig
	connected  bool
	mu         sync.RWMutex
	ctx        context.Context
	cancelFunc context.CancelFunc
}

// NewMongoDB creates a new MongoDB connection instance
func NewMongoDB(cfg *config.MongoDBConfig) *MongoDB {
	ctx, cancel := context.WithCancel(context.Background())
	return &MongoDB{
		config:     cfg,
		ctx:        ctx,
		cancelFunc: cancel,
	}
}

// Connect establishes a connection to MongoDB
func (m *MongoDB) Connect(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.connected {
		return nil
	}

	if err := helpers.CheckInternetConnection(); err != nil {
		zap.L().Error("no internet connection available for connect to MongoDB", zap.Error(err))
		return err
	}

	// Build connection URI
	uri := fmt.Sprintf("mongodb+srv://%s:%s@%s/?retryWrites=true&w=majority&appName=%s",
		m.config.Username,
		m.config.Password,
		m.config.Host,
		m.config.AppName,
	)

	options := options.Client().ApplyURI(uri)
	options.SetTLSConfig(&tls.Config{
		InsecureSkipVerify: true,
	})

	client, err := mongo.Connect(options)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	m.client = client
	m.database = client.Database(m.config.Database)
	m.connected = true

	return nil
}

// Close closes the MongoDB connection
func (m *MongoDB) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.connected {
		return nil
	}

	m.cancelFunc()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := m.client.Disconnect(ctx); err != nil {
		return fmt.Errorf("failed to disconnect from MongoDB: %w", err)
	}

	m.connected = false
	return nil
}

// Ping tests the MongoDB connection
func (m *MongoDB) Ping(ctx context.Context) error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if !m.connected {
		return fmt.Errorf("MongoDB is not connected")
	}

	return m.client.Ping(ctx, nil)
}

// IsConnected returns the connection status
func (m *MongoDB) IsConnected() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.connected
}

// GetDB returns the MongoDB database instance
func (m *MongoDB) GetDB() *mongo.Database {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.database
}

// GetClient returns the MongoDB client instance
func (m *MongoDB) GetClient() *mongo.Client {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.client
}

// GetCollection returns a MongoDB collection
func (m *MongoDB) GetCollection(name string) *mongo.Collection {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if m.database == nil {
		return nil
	}
	return m.database.Collection(name)
}
