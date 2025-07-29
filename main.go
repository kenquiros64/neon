package main

import (
	"embed"
	"neon/core/config"
	"neon/core/constants"
	"neon/core/services"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	logger, err := config.NewLogger()
	if err != nil {
		zap.L().Fatal("Failed to create logger", zap.Error(err))
	}
	zap.ReplaceGlobals(logger)

	// Load .env file if it exists (development), but don't fail if it doesn't (production)
	if err := godotenv.Load(); err != nil {
		zap.L().Debug("No .env file found, using config file", zap.Error(err))
	}

	dir, err := os.UserConfigDir()
	if err != nil {
		zap.L().Fatal("Failed to get user config directory", zap.Error(err))
	}

	dataDir := filepath.Join(dir, constants.AppName, constants.DataDir)
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		zap.L().Fatal("Failed to create data directory", zap.Error(err))
	}

	services.NewApp(assets).Startup()
}
