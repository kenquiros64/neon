package config

import (
	"os"
	"strings"

	"neon/core/helpers"
	"neon/core/models"

	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

const appSettingsFileName = "app_settings.yaml"

var cachedAppSettings *models.AppSettings

// DefaultAppSettings returns factory defaults for ticket printing.
func DefaultAppSettings() *models.AppSettings {
	return &models.AppSettings{
		PrintHeaderLine1: "TRANSPORTES",
		PrintHeaderLine2: "EL PUMA PARDO S.A",
		PrintHeaderPhone: "TEL: 2765-1349",
		PrintFooter:      "BUEN VIAJE",
	}
}

// LoadAppSettings loads print branding from disk.
func LoadAppSettings() (*models.AppSettings, error) {
	if cachedAppSettings != nil {
		return cachedAppSettings, nil
	}

	settings := DefaultAppSettings()
	path, err := getAppSettingsFilePath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			if writeErr := SaveAppSettings(settings); writeErr != nil {
				zap.L().Warn("could not write default app settings", zap.Error(writeErr))
			}
			cachedAppSettings = settings
			return settings, nil
		}
		return nil, err
	}

	if err := yaml.Unmarshal(data, settings); err != nil {
		return nil, err
	}

	normalizeAppSettings(settings)
	cachedAppSettings = settings
	return settings, nil
}

// SaveAppSettings persists settings and refreshes the cache.
func SaveAppSettings(settings *models.AppSettings) error {
	normalizeAppSettings(settings)
	path, err := getAppSettingsFilePath()
	if err != nil {
		return err
	}

	data, err := yaml.Marshal(settings)
	if err != nil {
		return err
	}

	if err := os.WriteFile(path, data, 0600); err != nil {
		return err
	}

	cachedAppSettings = settings
	return nil
}

func getAppSettingsFilePath() (string, error) {
	appDir, err := helpers.GetAppDataDir()
	if err != nil {
		return "", err
	}
	return appDir + "/" + appSettingsFileName, nil
}

func normalizeAppSettings(s *models.AppSettings) {
	if s == nil {
		return
	}
	if strings.TrimSpace(s.PrintHeaderLine1) == "" {
		s.PrintHeaderLine1 = "TRANSPORTES"
	}
	if strings.TrimSpace(s.PrintHeaderLine2) == "" {
		s.PrintHeaderLine2 = "EL PUMA PARDO S.A"
	}
	if strings.TrimSpace(s.PrintHeaderPhone) == "" {
		s.PrintHeaderPhone = "TEL: 2765-1349"
	}
	if strings.TrimSpace(s.PrintFooter) == "" {
		s.PrintFooter = "BUEN VIAJE"
	}
}
