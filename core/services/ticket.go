package services

import (
	"context"
	"database/sql"
	"errors"
	"neon/core/database/embedded"
	"neon/core/helpers"
	"neon/core/models"
	"neon/core/repositories/local"
	"time"

	"go.uber.org/zap"
)

// TicketService is a service for tickets
type TicketService struct {
	ctx          context.Context
	localDB      *embedded.SQLite
	printService *PrintService
}

// NewTicketService creates a new ticket service
func NewTicketService(localDB *embedded.SQLite, printService *PrintService) *TicketService {
	return &TicketService{localDB: localDB, printService: printService}
}

// startup starts the ticket service
func (t *TicketService) startup(ctx context.Context) {
	t.ctx = ctx
}

// AddTicket adds a ticket and returns the tickets with generated IDs
func (t *TicketService) AddTicket(ticket []models.Ticket) ([]models.Ticket, error) {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	output, err := repository.BulkCreate(ticket)
	if err != nil {
		zap.L().Error("failed to add tickets", zap.Error(err))
		return nil, err
	}

	return output, nil
}

// AddTicketWithPrint saves tickets and prints them. If printing fails (e.g. no paper, printer disconnected),
// created tickets are deleted and an error is returned so the sale is not persisted.
func (t *TicketService) AddTicketWithPrint(tickets []models.Ticket, printerName string) ([]models.Ticket, error) {
	// if t.printService == nil {
	// 	return nil, fmt.Errorf("print service is not available")
	// }

	// if printerName == "" {
	// 	return nil, fmt.Errorf("printer is not configured")
	// }

	// if err := t.printService.EnsurePrinterReady(printerName); err != nil {
	// 	zap.L().Warn("printer is not ready, skipping ticket creation", zap.Error(err))
	// 	return nil, err
	// }

	repository := local.NewTicketRepository(t.ctx, t.localDB)
	created, err := repository.BulkCreate(tickets)
	if err != nil {
		zap.L().Error("failed to add tickets", zap.Error(err))
		return nil, err
	}

	// if err := t.printService.PrintTickets(created, printerName); err != nil {
	// 	zap.L().Warn("print failed, rolling back tickets", zap.Error(err))
	// 	if delErr := repository.BulkDelete(created); delErr != nil {
	// 		zap.L().Error("failed to rollback tickets after print error", zap.Error(delErr))
	// 		return nil, err
	// 	}
	// 	return nil, err
	// }

	return created, nil
}

// UpdateTickets updates tickets
func (t *TicketService) UpdateTickets(tickets []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkUpdate(tickets); err != nil {
		zap.L().Error("failed to update tickets", zap.Error(err))
		return err
	}

	return nil
}

// NullifyTicket nullifies a ticket
func (t *TicketService) NullifyTicket(ticketID int64, reportID int64) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	ticket, err := repository.GetByID(ticketID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return helpers.ErrRowNotFound
		}
		zap.L().Error("failed to get ticket", zap.Error(err))
		return err
	}

	reportRepository := local.NewReportRepository(t.ctx, t.localDB)
	report, err := reportRepository.GetByID(reportID)
	if err != nil {
		zap.L().Error("failed to get report", zap.Error(err))
		return err
	}

	if ticket.ReportID != report.ID {
		return helpers.ErrTicketNotBelongToReport
	}

	// If the report is partiallly closed, we can't nullify a ticket created before the partial closed at
	if report.PartialClosedAt != nil {
		createdAt, err := time.Parse(time.RFC3339, ticket.CreatedAt)
		if err != nil {
			zap.L().Error("failed to parse created at", zap.Error(err))
			return err
		}

		partialClosedAt, err := time.Parse(time.RFC3339, *report.PartialClosedAt)
		if err != nil {
			zap.L().Error("failed to parse created at", zap.Error(err))
			return err
		}

		if createdAt.After(partialClosedAt) {
			if ticket.IsNull {
				return helpers.ErrTicketAlreadyNullified
			}
			if err := repository.Update(models.Ticket{ID: ticketID, IsNull: true, ReportID: reportID}); err != nil {
				zap.L().Error("failed to nullify ticket", zap.Error(err))
				return err
			}

			return nil
		}
		return helpers.ErrTicketAlreadyClosed
	}

	if ticket.IsNull {
		return helpers.ErrTicketAlreadyNullified
	}

	if err := repository.Update(models.Ticket{ID: ticketID, IsNull: true, ReportID: reportID}); err != nil {
		zap.L().Error("failed to nullify ticket", zap.Error(err))
		return err
	}

	return nil
}

// DeleteTickets deletes a bulk of tickets
func (t *TicketService) DeleteTickets(tickets []models.Ticket) error {
	repository := local.NewTicketRepository(t.ctx, t.localDB)
	if err := repository.BulkDelete(tickets); err != nil {
		zap.L().Error("failed to delete tickets", zap.Error(err))
		return err
	}

	return nil
}
