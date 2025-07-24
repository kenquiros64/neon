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

// AddTicket adds a ticket
func (t *TicketService) AddTicket(ticket []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkAdd(ticket); err != nil {
		return err
	}

	return nil
}

// UpdateTickets updates tickets
func (t *TicketService) UpdateTickets(tickets []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkUpdate(tickets); err != nil {
		return err
	}

	return nil
}
