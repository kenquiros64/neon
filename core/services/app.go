package services

import (
	"context"
	"embed"
	"neon/core/config"
	"neon/core/database/connections/embedded"
	"neon/core/database/connections/mongodb"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"go.uber.org/zap"
)

// App is the main application struct
type App struct {
	assets embed.FS
}

var (
	remotedb *mongodb.MongoDB
	cloverdb *embedded.CloverDB
	sqlitedb *embedded.Database
)

// NewApp creates a new App instance
func NewApp(assets embed.FS) *App {
	return &App{assets: assets}
}

// Startup initializes the application
func (a *App) Startup() {

	initialize(context.Background())
	syncService := NewSyncService(remotedb, cloverdb)
	authService := NewAuthService(remotedb, cloverdb)
	userService := NewUserService(cloverdb, remotedb)
	ticketService := NewTicketService(sqlitedb)
	routeService := NewRouteService(remotedb, cloverdb)
	counterService := NewCounterService(cloverdb)
	reportService := NewReportService(sqlitedb)

	// repository := local.NewCountRepository(cloverdb)
	// repository.Clear()

	err := wails.Run(&options.App{
		Title:     "neon",
		MinWidth:  1280,
		MinHeight: 900,
		MaxWidth:  1920,
		MaxHeight: 1080,
		AssetServer: &assetserver.Options{
			Assets: a.assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			syncService.startup(ctx)
			authService.startup(ctx)
			userService.startup(ctx)
			ticketService.startup(ctx)
			routeService.startup(ctx)
			reportService.startup(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			shutdown()
		},
		Bind: []any{
			syncService,
			authService,
			userService,
			ticketService,
			routeService,
			counterService,
			reportService,
		},
	})

	if err != nil {
		zap.L().Error("Error running application", zap.Error(err))
	}

}

func initialize(ctx context.Context) {
	remotedb = mongodb.NewMongoDB(config.DefaultMongoDBConfig())
	if err := remotedb.Connect(ctx); err != nil {
		zap.L().Fatal("Error connecting to remote database", zap.Error(err))
	}

	cloverdb = embedded.NewCloverDB(config.DefaultCloverDBConfig())
	if err := cloverdb.Connect(ctx); err != nil {
		zap.L().Fatal("Error connecting to local database", zap.Error(err))
	}

	sqlitedb = embedded.NewSQLite(config.DefaultSQLiteConfig())
	if err := sqlitedb.Connect(ctx); err != nil {
		zap.L().Fatal("Error connecting to sqlite database", zap.Error(err))
	}
}

func shutdown() {
	if err := remotedb.Close(); err != nil {
		zap.L().Debug("Error closing remote database", zap.Error(err))
	}
	if err := cloverdb.Close(); err != nil {
		zap.L().Debug("Error closing clover database", zap.Error(err))
	}
	if err := sqlitedb.Close(); err != nil {
		zap.L().Debug("Error closing sqlite database", zap.Error(err))
	}
}
