// Package helpers provides utility functions for file operations
package helpers

import (
	"net/http"
	"os"
	"path/filepath"
	"time"

	"neon/core/constants"
)

// CheckInternetConnection checks if there is an active internet connection
// by making a simple HTTP request to a reliable endpoint
func CheckInternetConnection() error {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Try to reach a reliable endpoint
	_, err := client.Head("https://www.google.com")
	if err != nil {
		// If that fails, try another reliable endpoint
		_, err = client.Head("https://www.cloudflare.com")
		if err != nil {
			return ErrNoInternetConnection
		}
	}

	return nil
}

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
