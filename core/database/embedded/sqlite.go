package embedded

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	_ "modernc.org/sqlite" // Import SQLite driver

	"neon/core/config"
	"neon/core/constants"
)

// SQLite represents a SQLite database connection
type SQLite struct {
	db        *sql.DB
	ctx       context.Context
	config    *config.SQLiteConfig
	connected bool
	mu        sync.RWMutex
}

// NewSQLite creates a new SQLite connection instance
func NewSQLite(cfg *config.SQLiteConfig) *SQLite {
	return &SQLite{
		config: cfg,
	}
}

// Connect establishes a connection to SQLite
func (s *SQLite) Connect(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.connected {
		return nil
	}
	dsn := s.config.FilePath
	if s.config.InMemory {
		dsn = ":memory:"
	}

	// Create database directory if it doesn't exist
	if !s.config.InMemory {
		if err := s.createDatabaseDirectory(); err != nil {
			return fmt.Errorf("failed to create database directory: %w", err)
		}
	}

	// Open database connection
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return fmt.Errorf("failed to open SQLite database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(s.config.MaxOpenConns)
	db.SetMaxIdleConns(s.config.MaxIdleConns)

	// Test the connection
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return fmt.Errorf("failed to ping SQLite database: %w", err)
	}

	s.db = db
	s.connected = true

	// Initialize tables
	if err := s.initTables(); err != nil {
		return fmt.Errorf("failed to initialize tables: %w", err)
	}

	// Initialize triggers
	if err := s.initTriggers(); err != nil {
		return fmt.Errorf("failed to initialize triggers: %w", err)
	}

	return nil
}

// Close closes the SQLite connection
func (s *SQLite) Close() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.connected {
		return nil
	}

	if err := s.db.Close(); err != nil {
		return fmt.Errorf("failed to close SQLite database: %w", err)
	}

	s.connected = false
	return nil
}

// Ping tests the SQLite connection
func (s *SQLite) Ping(ctx context.Context) error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.connected {
		return fmt.Errorf("SQLite is not connected")
	}

	return s.db.PingContext(ctx)
}

// IsConnected returns the connection status
func (s *SQLite) IsConnected() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.connected
}

// GetDB returns the SQLite database instance
func (s *SQLite) GetDB() *sql.DB {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.db
}

// createDatabaseDirectory creates the directory for the database file
func (s *SQLite) createDatabaseDirectory() error {
	dir := filepath.Dir(s.config.FilePath)
	if dir == "." {
		return nil
	}

	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}

	return nil
}

// BeginTx begins a new transaction
func (s *SQLite) BeginTx(ctx context.Context, opts *sql.TxOptions) (*sql.Tx, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.connected {
		return nil, fmt.Errorf("SQLite is not connected")
	}

	return s.db.BeginTx(ctx, opts)
}

// Exec executes a query without returning any rows
func (s *SQLite) Exec(query string, args ...interface{}) (sql.Result, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.connected {
		return nil, fmt.Errorf("SQLite is not connected")
	}

	return s.db.Exec(query, args...)
}

// Query executes a query that returns rows
func (s *SQLite) Query(query string, args ...interface{}) (*sql.Rows, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.connected {
		return nil, fmt.Errorf("SQLite is not connected")
	}

	return s.db.Query(query, args...)
}

// QueryRow executes a query that returns at most one row
func (s *SQLite) QueryRow(query string, args ...interface{}) *sql.Row {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return s.db.QueryRow(query, args...)
}

// initTables creates the necessary tables if they don't exist
func (s *SQLite) initTables() error {
	if err := s.createReportsTable(); err != nil {
		return err
	}
	return s.createTicketsTable()
}

// initTriggers creates the necessary triggers if they don't exist
func (s *SQLite) initTriggers() error {
	if err := s.createTriggerUpdateReportAfterTicketInsert(); err != nil {
		return err
	}
	if err := s.createTriggerUpdateReportAfterTicketIsUpdatedToNull(); err != nil {
		return err
	}
	return nil
}

// createReportsTable creates the reports table if it doesn't exist
func (s *SQLite) createReportsTable() error {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS %s (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			timetable TEXT NOT NULL DEFAULT 'regular',
			partial_tickets INTEGER NOT NULL DEFAULT 0,
			partial_cash INTEGER NOT NULL DEFAULT 0,
			final_cash INTEGER NOT NULL DEFAULT 0,
			status BOOLEAN NOT NULL DEFAULT 0,
			total_cash INTEGER NOT NULL DEFAULT 0,
			total_tickets INTEGER NOT NULL DEFAULT 0,
			total_gold INTEGER NOT NULL DEFAULT 0,
			total_gold_cash INTEGER NOT NULL DEFAULT 0,
			total_null INTEGER NOT NULL DEFAULT 0,
			total_null_cash INTEGER NOT NULL DEFAULT 0,
			total_regular INTEGER NOT NULL DEFAULT 0,
			total_regular_cash INTEGER NOT NULL DEFAULT 0,
			partial_closed_at TEXT,
			closed_at TEXT,
			created_at TEXT
		)
	`, constants.ReportsTable)

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create reports table: %w", err)
	}

	return nil
}

// createTicketsTable creates the tickets table if it doesn't exist
func (s *SQLite) createTicketsTable() error {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS %s (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			departure TEXT NOT NULL,
			destination TEXT NOT NULL,
			username TEXT NOT NULL,
			stop TEXT NOT NULL,
			time TEXT NOT NULL,
			fare INTEGER NOT NULL DEFAULT 0,
			is_gold BOOLEAN NOT NULL DEFAULT 0,
			is_null BOOLEAN NOT NULL DEFAULT 0,
			id_number TEXT NOT NULL,
			report_id INTEGER NOT NULL,
			created_at TEXT,
			updated_at TEXT,
			FOREIGN KEY (report_id) REFERENCES %s(id) ON DELETE CASCADE
		)
	`, constants.TicketsTable, constants.ReportsTable)

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create tickets table: %w", err)
	}

	return nil
}

// createTriggerUpdateReportAfterTicketInsert creates the trigger to update the report after
// a ticket is inserted
func (s *SQLite) createTriggerUpdateReportAfterTicketInsert() error {
	query := `
		CREATE TRIGGER IF NOT EXISTS update_report_after_ticket_insert
		AFTER INSERT ON tickets
		FOR EACH ROW
		BEGIN
			UPDATE reports
			SET
				total_cash = total_cash + NEW.fare,
				total_tickets = total_tickets + 1,
				total_gold = total_gold + CASE WHEN NEW.is_gold = 1 THEN 1 ELSE 0 END,
				total_gold_cash = total_gold_cash + CASE WHEN NEW.is_gold = 1 THEN NEW.fare ELSE 0 END,
				total_regular = total_regular + CASE WHEN NEW.is_gold = 0 AND NEW.is_null = 0 THEN 1 ELSE 0 END,
				total_regular_cash = total_regular_cash + CASE WHEN NEW.is_gold = 0 AND NEW.is_null = 0 THEN NEW.fare ELSE 0 END,
				partial_tickets = CASE WHEN partial_closed_at IS NOT NULL THEN partial_tickets + 1 ELSE partial_tickets END,
				partial_cash = CASE WHEN partial_closed_at IS NOT NULL THEN partial_cash + NEW.fare ELSE partial_cash END
			WHERE id = NEW.report_id;
		END
	`

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create trigger update_report_after_ticket_insert: %w", err)
	}

	return nil
}

// createTriggerUpdateReportAfterTicketIsUpdatedToNull creates the trigger to update the report after
// a ticket is updated to null
func (s *SQLite) createTriggerUpdateReportAfterTicketIsUpdatedToNull() error {
	query := `
		CREATE TRIGGER IF NOT EXISTS update_report_after_ticket_null
		AFTER UPDATE OF is_null ON tickets
		FOR EACH ROW
		WHEN NEW.is_null = 1 AND OLD.is_null = 0
		BEGIN
			UPDATE reports
			SET
				total_null = total_null + 1,
				total_null_cash = total_null_cash + NEW.fare,
				total_tickets = total_tickets - 1,
				total_cash = total_cash - NEW.fare,
				partial_tickets = CASE WHEN partial_closed_at IS NOT NULL THEN partial_tickets - 1 ELSE partial_tickets END,
				partial_cash = CASE WHEN partial_closed_at IS NOT NULL THEN partial_cash - NEW.fare ELSE partial_cash END
			WHERE id = NEW.report_id;
		END
	`

	_, err := s.db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to create trigger update_report_after_ticket_is_updated_to_null: %w", err)
	}

	return nil
}
