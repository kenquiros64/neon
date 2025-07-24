// Package helpers provides utility functions for file operations
package helpers

import (
	"os"
	"path/filepath"

	"neon/core/constants"
)

// GetAppDataDir returns the path to the app data directory
func GetAppDataDir() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	appDir := filepath.Join(dir, constants.AppName)
	err = os.MkdirAll(appDir, 0755)
	if err != nil {
		return "", err
	}

	return appDir, nil
}
