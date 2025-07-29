// Package config provides configuration for the application
package config

import (
	"os"
	"path/filepath"

	"neon/core/constants"
	"neon/core/helpers"

	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

// MongoDBConfig represents MongoDB connection configuration
type MongoDBConfig struct {
	Host       string `yaml:"host"`
	Port       int    `yaml:"port"`
	AppName    string `yaml:"app_name"`
	Database   string `yaml:"database"`
	Username   string `yaml:"username"`
	Password   string `yaml:"password"`
	SSLEnabled bool   `yaml:"ssl_enabled"`
}

// SQLiteConfig represents SQLite connection configuration
type SQLiteConfig struct {
	FilePath     string
	InMemory     bool
	MaxOpenConns int
	MaxIdleConns int
}

// CloverDBConfig represents CloverDB connection configuration
type CloverDBConfig struct {
	FilePath string
}

var mongoConfig *MongoDBConfig

// LoadMongoConfig loads MongoDB configuration from mongo.yaml with environment variable fallbacks
func LoadMongoConfig() (*MongoDBConfig, error) {
	if mongoConfig != nil {
		return mongoConfig, nil
	}

	// Get config file path
	configPath, err := getMongoConfigFilePath()
	if err != nil {
		zap.L().Error("Failed to get mongo config file path", zap.Error(err))
		return nil, err
	}

	// Load from file if it exists, otherwise create default config
	config := &MongoDBConfig{}
	err = loadMongoConfigFromFile(configPath, config)
	if err != nil {
		zap.L().Info("Failed to load mongo config from file, using defaults", zap.Error(err))
		applyMongoEnvironmentOverrides(config)
	}

	mongoConfig = config
	return mongoConfig, nil
}

// getMongoConfigFilePath returns the path to the mongo.yaml file
func getMongoConfigFilePath() (string, error) {
	appDir, err := helpers.GetAppDataDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(appDir, "config.yaml"), nil
}

// loadMongoConfigFromFile loads MongoDB configuration from a YAML file
func loadMongoConfigFromFile(path string, config *MongoDBConfig) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return yaml.Unmarshal(data, config)
}

// applyMongoEnvironmentOverrides applies environment variable overrides to the MongoDB config
func applyMongoEnvironmentOverrides(config *MongoDBConfig) {
	if host := os.Getenv("MONGO_HOST"); host != "" {
		config.Host = host
	}
	if username := os.Getenv("MONGO_USERNAME"); username != "" {
		config.Username = username
	}
	if password := os.Getenv("MONGO_PASSWORD"); password != "" {
		config.Password = password
	}
	if appName := os.Getenv("MONGO_APP_NAME"); appName != "" {
		config.AppName = appName
	}
	if database := os.Getenv("MONGO_DATABASE"); database != "" {
		config.Database = database
	}
}

// GetMongoDBConfig returns MongoDB configuration from the loaded config
func GetMongoDBConfig() *MongoDBConfig {
	config, err := LoadMongoConfig()
	if err != nil {
		zap.L().Fatal("Failed to load MongoDB configuration", zap.Error(err))
	}

	// Validate required fields if they're still empty after loading
	if config.Username == "" || config.Password == "" {
		zap.L().Fatal("MongoDB username and password must be configured in mongo.yaml or environment variables")
	}

	return config
}

// GetSQLiteConfig returns default SQLite configuration
func GetSQLiteConfig() *SQLiteConfig {
	dbName := "oxygen.db"
	appDir, err := helpers.GetAppDataDir()
	if err != nil {
		zap.L().Fatal("Failed to get app data directory", zap.Error(err))
	}
	dbPath := filepath.Join(appDir, constants.DataDir, dbName)

	return &SQLiteConfig{
		FilePath:     dbPath,
		InMemory:     false,
		MaxOpenConns: 25,
		MaxIdleConns: 25,
	}
}

// GetCloverDBConfig returns default CloverDB configuration
func GetCloverDBConfig() *CloverDBConfig {
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
