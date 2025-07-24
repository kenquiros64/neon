package config

import (
	"fmt"
	"neon/core/constants"
	"os"
	"path/filepath"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// NewLogger creates a new logger
func NewLogger() (*zap.Logger, error) {
	// Get appropriate user directory
	logDir, err := os.UserCacheDir()
	if err != nil {
		return nil, fmt.Errorf("cannot determine cache dir: %w", err)
	}

	logPath := filepath.Join(logDir, constants.AppName, "logs")
	err = os.MkdirAll(logPath, 0755)
	if err != nil {
		return nil, fmt.Errorf("cannot create log directory: %w", err)
	}

	logFile := filepath.Join(logPath, "app.log")
	fileWriter, err := os.OpenFile(logFile, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return nil, fmt.Errorf("cannot open log file: %w", err)
	}

	// Encoder config
	encoderCfg := zapcore.EncoderConfig{
		TimeKey:       "time",
		LevelKey:      "level",
		NameKey:       "logger",
		CallerKey:     "caller",
		MessageKey:    "msg",
		StacktraceKey: "stacktrace",
		LineEnding:    zapcore.DefaultLineEnding,
		EncodeLevel:   zapcore.CapitalLevelEncoder,
		EncodeTime:    zapcore.ISO8601TimeEncoder,
		EncodeCaller:  zapcore.ShortCallerEncoder,
	}

	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoderCfg),
		zapcore.AddSync(fileWriter),
		zap.InfoLevel, // default log level
	)

	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return logger, nil
}
