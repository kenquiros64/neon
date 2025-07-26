package services

import (
	"context"
	"neon/core/database/connections/embedded"
	"neon/core/models"
	"neon/core/repositories/local"
)

// TicketService is a service for tickets
type TicketService struct {
	ctx     context.Context
	localDB *embedded.Database
}

// NewTicketService creates a new ticket service
func NewTicketService(localDB *embedded.Database) *TicketService {
	return &TicketService{localDB: localDB}
}

// startup starts the ticket service
func (t *TicketService) startup(ctx context.Context) {
	t.ctx = ctx
}

// AddTicket adds a ticket and returns the tickets with generated IDs
func (t *TicketService) AddTicket(ticket []models.Ticket) ([]models.Ticket, error) {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	output, err := repository.BulkAdd(ticket)
	if err != nil {
		return nil, err
	}

	return output, nil
}

// UpdateTickets updates tickets
func (t *TicketService) UpdateTickets(tickets []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkUpdate(tickets); err != nil {
		return err
	}

	return nil
}

// DeleteTickets deletes a bulk of tickets
func (t *TicketService) DeleteTickets(tickets []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkDelete(tickets); err != nil {
		return err
	}

	return nil
}
