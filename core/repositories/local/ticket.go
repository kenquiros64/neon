package local

import (
	"context"
	"fmt"
	"neon/core/database/connections/embedded"
	"neon/core/models"
	"time"

	"github.com/doug-martin/goqu/v9"
)

// TicketRepository implements TicketRepository for SQLite using goqu
type TicketRepository struct {
	ctx context.Context
	db  *embedded.Database
}

// NewTicketRepository creates a new ticket repository with goqu
func NewTicketRepository(ctx context.Context, db *embedded.Database) *TicketRepository {
	return &TicketRepository{
		ctx: ctx,
		db:  db,
	}
}

// BulkCreate creates a bulk of tickets to the database and returns them with generated IDs
func (r *TicketRepository) BulkCreate(tickets []models.Ticket) ([]models.Ticket, error) {
	if len(tickets) == 0 {
		return tickets, nil
	}

	tx, err := r.db.BeginTx(r.ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}

	var updatedTickets []models.Ticket

	for i, ticket := range tickets {
		query := dialect.Insert(TableTickets).Rows(ticket)
		sql, args, err := query.Prepared(true).ToSQL()
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to prepare query: %w", err)
		}

		result, err := tx.Exec(sql, args...)
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to add ticket: %w", err)
		}

		// Get the generated ID
		generatedID, err := result.LastInsertId()
		if err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to get generated ID: %w", err)
		}

		// Update the ticket with the generated ID
		tickets[i].ID = generatedID
		updatedTickets = append(updatedTickets, tickets[i])
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return updatedTickets, nil
}

// BulkUpdate updates a bulk of tickets in the database
func (r *TicketRepository) BulkUpdate(tickets []models.Ticket) error {
	if len(tickets) == 0 {
		return nil
	}

	tx, err := r.db.BeginTx(r.ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	for _, ticket := range tickets {
		query := dialect.Update(TableTickets).Set(ticket).Where(ColumnID.Eq(ticket.ID))
		sql, args, err := query.Prepared(true).ToSQL()
		if err != nil {
			return fmt.Errorf("failed to prepare query: %w", err)
		}

		_, err = tx.Exec(sql, args...)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to update ticket: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Update updates a ticket in the database
func (r *TicketRepository) Update(ticket models.Ticket) error {
	if ticket.ID == 0 {
		return fmt.Errorf("ticket id is required")
	}

	if ticket.ReportID == 0 {
		return fmt.Errorf("ticket report id is required")
	}

	now := time.Now()
	ticket.UpdatedAt = now.Format(time.DateTime)

	query := dialect.Update(TableTickets).Set(ticket).Where(ColumnID.Eq(ticket.ID))

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return fmt.Errorf("failed to prepare query: %w", err)
	}

	tx, err := r.db.BeginTx(r.ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	_, err = tx.Exec(sql, args...)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update ticket: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// BulkDelete deletes a bulk of tickets in the database
func (r *TicketRepository) BulkDelete(tickets []models.Ticket) error {
	if len(tickets) == 0 {
		return nil
	}

	tx, err := r.db.BeginTx(r.ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	for _, ticket := range tickets {
		query := dialect.Delete(TableTickets).Where(ColumnID.Eq(ticket.ID))
		sql, args, err := query.Prepared(true).ToSQL()
		if err != nil {
			return fmt.Errorf("failed to prepare query: %w", err)
		}

		_, err = tx.Exec(sql, args...)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to delete ticket: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetByReportID gets a ticket by report id
func (r *TicketRepository) GetByReportID(
	reportID int64,
) ([]models.Ticket, error) {
	query := dialect.Select().
		From(TableTickets).
		Where(
			goqu.I("report_id").Eq(reportID),
		)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	rows, err := r.db.GetDB().Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get ticket: %w", err)
	}

	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		err = rows.Scan(
			&ticket.ID,
			&ticket.Departure,
			&ticket.Destination,
			&ticket.Username,
			&ticket.Stop,
			&ticket.Time,
			&ticket.Fare,
			&ticket.IsGold,
			&ticket.IsNull,
			&ticket.IDNumber,
			&ticket.ReportID,
			&ticket.CreatedAt,
			&ticket.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, ticket)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to get tickets: %w", err)
	}

	return tickets, nil
}

// GetByID gets a ticket by id
func (r *TicketRepository) GetByID(id int64) (*models.Ticket, error) {
	query := dialect.Select(goqu.C("*")).From(TableTickets).Where(ColumnID.Eq(id)).Limit(1)

	sql, args, err := query.Prepared(true).ToSQL()
	if err != nil {
		return nil, fmt.Errorf("failed to prepare query: %w", err)
	}

	row := r.db.GetDB().QueryRow(sql, args...)

	var ticket models.Ticket
	err = row.Scan(
		&ticket.ID,
		&ticket.Departure,
		&ticket.Destination,
		&ticket.Username,
		&ticket.Stop,
		&ticket.Time,
		&ticket.Fare,
		&ticket.IsGold,
		&ticket.IsNull,
		&ticket.IDNumber,
		&ticket.ReportID,
		&ticket.CreatedAt,
		&ticket.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan ticket: %w", err)
	}

	if err := row.Err(); err != nil {
		return nil, fmt.Errorf("failed to get ticket: %w", err)
	}

	return &ticket, nil
}
