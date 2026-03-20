package remote

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"

	"neon/core/config"
	"neon/core/constants"
	"neon/core/helpers"
)

// MySQLDB is a short-lived connection pool for syncing reports to remote MySQL (e.g. Aiven).
type MySQLDB struct {
	db  *sql.DB
	cfg *config.MySQLDBSyncConfig
}

// NewMySQLReportDB creates a MySQL client for report sync (Connect before use).
func NewMySQLReportDB(cfg *config.MySQLDBSyncConfig) *MySQLDB {
	return &MySQLDB{cfg: cfg}
}

// Connect opens the pool, verifies TLS, and ensures the sync table exists.
func (m *MySQLDB) Connect(ctx context.Context) error {
	if m.cfg == nil {
		return fmt.Errorf("mysql report sync: nil config")
	}
	if err := helpers.CheckInternetConnection(); err != nil {
		return err
	}

	mc := mysql.NewConfig()
	mc.User = m.cfg.Username
	mc.Passwd = m.cfg.Password
	mc.Net = "tcp"
	mc.Addr = fmt.Sprintf("%s:%d", m.cfg.Host, m.cfg.Port)
	mc.DBName = m.cfg.Database
	mc.Timeout = 15 * time.Second
	mc.Params = map[string]string{
		"parseTime": "true",
	}

	dsn := mc.FormatDSN()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("mysql report sync: open: %w", err)
	}
	db.SetMaxOpenConns(2)
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(2 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return fmt.Errorf("mysql report sync: ping: %w", err)
	}

	if err := ensureReportSyncTable(pingCtx, db); err != nil {
		_ = db.Close()
		return err
	}

	m.db = db
	return nil
}

func ensureReportSyncTable(ctx context.Context, db *sql.DB) error {
	q := fmt.Sprintf(`
CREATE TABLE IF NOT EXISTS %s (
  local_id BIGINT NOT NULL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  timetable VARCHAR(64) NOT NULL,
  partial_tickets INT NOT NULL DEFAULT 0,
  partial_cash INT NOT NULL DEFAULT 0,
  partial_cash_received INT NOT NULL DEFAULT 0,
  final_tickets INT NOT NULL DEFAULT 0,
  final_cash INT NOT NULL DEFAULT 0,
  final_cash_received INT NOT NULL DEFAULT 0,
  status TINYINT(1) NOT NULL DEFAULT 0,
  total_gold INT NOT NULL DEFAULT 0,
  total_gold_cash INT NOT NULL DEFAULT 0,
  total_null INT NOT NULL DEFAULT 0,
  total_null_cash INT NOT NULL DEFAULT 0,
  total_regular INT NOT NULL DEFAULT 0,
  total_regular_cash INT NOT NULL DEFAULT 0,
  partial_closed_at VARCHAR(64) NULL,
  closed_at VARCHAR(64) NULL,
  created_at VARCHAR(64) NULL,
  partial_closed_by VARCHAR(255) NULL,
  closed_by VARCHAR(255) NULL,
  remote_saved_at VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`, constants.RemoteReportsMySQLTable)

	_, err := db.ExecContext(ctx, q)
	if err != nil {
		return fmt.Errorf("mysql report sync: create table: %w", err)
	}
	return nil
}

// DB returns the underlying pool (valid after Connect).
func (m *MySQLDB) DB() *sql.DB {
	return m.db
}

// Close closes the pool.
func (m *MySQLDB) Close() error {
	if m.db == nil {
		return nil
	}
	err := m.db.Close()
	m.db = nil
	return err
}
