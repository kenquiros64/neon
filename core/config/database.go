// Package config provides configuration for the application
package config

import (
	"os"
	"path/filepath"
	"time"

	"neon/core/constants"
	"neon/core/helpers"

	"go.uber.org/zap"
)

// MongoDBConfig represents MongoDB connection configuration
type MongoDBConfig struct {
	Host       string `json:"host"`
	Port       int    `json:"port"`
	AppName    string `json:"app_name"`
	Database   string `json:"database"`
	Username   string `json:"username"`
	Password   string `json:"password"`
	SSLEnabled bool   `json:"ssl_enabled"`
}

// SQLiteConfig represents SQLite connection configuration
type SQLiteConfig struct {
	FilePath         string        `json:"file_path"`
	InMemory         bool          `json:"in_memory"`
	CacheSize        int           `json:"cache_size"`
	BusyTimeout      time.Duration `json:"busy_timeout"`
	JournalMode      string        `json:"journal_mode"`
	Synchronous      string        `json:"synchronous"`
	ForeignKeys      bool          `json:"foreign_keys"`
	CheckConstraints bool          `json:"check_constraints"`
	MaxOpenConns     int           `json:"max_open_conns"`
	MaxIdleConns     int           `json:"max_idle_conns"`
	ConnMaxLifetime  time.Duration `json:"conn_max_lifetime"`
}

// CloverDBConfig represents CloverDB connection configuration
type CloverDBConfig struct {
	FilePath string `json:"file_path"`
}

// DefaultMongoDBConfig returns default MongoDB configuration
func DefaultMongoDBConfig() *MongoDBConfig {
	password := os.Getenv("MONGO_PASSWORD")
	if password == "" {
		zap.L().Fatal("MONGO_PASSWORD environment variable is not set")
	}
	username := os.Getenv("MONGO_USERNAME")
	if username == "" {
		zap.L().Fatal("MONGO_USERNAME environment variable is not set")
	}
	host := os.Getenv("MONGO_HOST")
	if host == "" {
		zap.L().Fatal("MONGO_HOST environment variable is not set")
	}

	appName := os.Getenv("MONGO_APP_NAME")
	if appName == "" {
		zap.L().Fatal("MONGO_APP_NAME environment variable is not set")
	}

	database := os.Getenv("MONGO_DATABASE")
	if database == "" {
		zap.L().Fatal("MONGO_DATABASE environment variable is not set")
	}

	return &MongoDBConfig{
		Host:       host,
		Database:   database,
		AppName:    appName,
		SSLEnabled: false,
		Username:   username,
		Password:   password,
	}
}

// DefaultSQLiteConfig returns default SQLite configuration
func DefaultSQLiteConfig() *SQLiteConfig {
	dbName := "oxygen.db"
	appDir, err := helpers.GetAppDataDir()
	if err != nil {
		zap.L().Fatal("Failed to get app data directory", zap.Error(err))
	}
	dbPath := filepath.Join(appDir, constants.DataDir, dbName)

	return &SQLiteConfig{
		FilePath:        dbPath,
		InMemory:        false,
		MaxOpenConns:    25,
		MaxIdleConns:    25,
		ConnMaxLifetime: 5 * time.Minute,
	}
}

// DefaultCloverDBConfig returns default CloverDB configuration
func DefaultCloverDBConfig() *CloverDBConfig {
	dbName := "titanium"
	appDir, err := helpers.GetAppDataDir()
	if err != nil {
		zap.L().Fatal("Failed to get app data directory", zap.Error(err))
	}
	dbPath := filepath.Join(appDir, constants.DataDir, dbName)

	if err := os.MkdirAll(dbPath, 0755); err != nil {
		zap.L().Fatal("Failed to create clover database directory", zap.Error(err))
	}

	return &CloverDBConfig{
		FilePath: dbPath,
	}
}
