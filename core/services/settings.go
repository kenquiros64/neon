package services

import (
	"context"
	"neon/core/config"
	"neon/core/models"
)

// SettingsService exposes app booth + print branding configuration to the UI.
type SettingsService struct {
	ctx context.Context
}

// NewSettingsService creates a settings service.
func NewSettingsService() *SettingsService {
	return &SettingsService{}
}

func (s *SettingsService) startup(ctx context.Context) {
	s.ctx = ctx
}

// GetAppSettings returns persisted booth and print settings.
func (s *SettingsService) GetAppSettings() (*models.AppSettings, error) {
	return config.LoadAppSettings()
}

// SaveAppSettings persists booth and print settings.
func (s *SettingsService) SaveAppSettings(settings models.AppSettings) (*models.AppSettings, error) {
	if err := config.SaveAppSettings(&settings); err != nil {
		return nil, err
	}
	return config.LoadAppSettings()
}
