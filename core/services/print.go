package services

import (
	"errors"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	"github.com/DevLumuz/go-escpos"

	"neon/core/helpers"
	"neon/core/helpers/enums"
	"neon/core/models"
)

// escposSafe normalizes text for ESC/POS printers that use limited code pages (e.g. CP437):
// Spanish accents -> ASCII, and CRC colón (₡) -> "CRC " so it prints correctly.
var escposReplacer = strings.NewReplacer(
	"₡", "CRC ",
	"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
	"Á", "A", "É", "E", "Í", "I", "Ó", "O", "Ú", "U",
	"ñ", "n", "Ñ", "N", "ü", "u", "Ü", "U",
	"¡", "!", "¿", "?",
)

func escposSafe(s string) string { return escposReplacer.Replace(s) }

const (
	printerDialTimeout  = 3 * time.Second
	printerReadTimeout  = 2 * time.Second
	printerWriteTimeout = 5 * time.Second
)

type deadlineConn struct {
	net.Conn
	readTimeout  time.Duration
	writeTimeout time.Duration
}

func (c *deadlineConn) Read(p []byte) (int, error) {
	if c.readTimeout > 0 {
		if err := c.Conn.SetReadDeadline(time.Now().Add(c.readTimeout)); err != nil {
			return 0, err
		}
	}
	return c.Conn.Read(p)
}

func (c *deadlineConn) Write(p []byte) (int, error) {
	if c.writeTimeout > 0 {
		if err := c.Conn.SetWriteDeadline(time.Now().Add(c.writeTimeout)); err != nil {
			return 0, err
		}
	}
	return c.Conn.Write(p)
}

// PrintService handles thermal receipt printing over Ethernet.
type PrintService struct{}

// NewPrintService creates a new print service.
func NewPrintService() *PrintService {
	return &PrintService{}
}

func (p *PrintService) openPrinter(printerName string) (escpos.Printer, string, error) {
	address, err := helpers.ResolvePrinterAddress(printerName)
	if err != nil {
		return escpos.Printer{}, "", err
	}

	conn, err := net.DialTimeout("tcp", address, printerDialTimeout)
	if err != nil {
		return escpos.Printer{}, "", fmt.Errorf("connect to printer %q: %w", address, err)
	}

	printer := escpos.NewPrinter(&deadlineConn{
		Conn:         conn,
		readTimeout:  printerReadTimeout,
		writeTimeout: printerWriteTimeout,
	})

	return printer, address, nil
}

// printerSession opens a printer, validates its status, runs fn, and closes it.
func (p *PrintService) printerSession(printerName string, fn func(printer escpos.Printer) error) error {
	printer, address, err := p.openPrinter(printerName)
	if err != nil {
		return err
	}
	defer func() { _ = printer.Close() }()

	if err := p.ensurePrinterReady(printer, address); err != nil {
		return err
	}

	return fn(printer)
}

func (p *PrintService) ensurePrinterReady(printer escpos.Printer, address string) error {
	if _, err := printer.TransmitPrinterStatus(); err != nil {
		return fmt.Errorf("printer %q did not respond to status checks: %w", address, err)
	}

	offlineStatus, err := printer.TransmitOfflineStatus()
	if err != nil {
		return fmt.Errorf("printer %q offline status unavailable: %w", address, err)
	}

	switch {
	case offlineStatus.CoverOpen:
		return fmt.Errorf("printer %q cover is open", address)
	case offlineStatus.PrintingStopped:
		return fmt.Errorf("printer %q is not ready to print", address)
	case offlineStatus.ErrorOccured:
		return fmt.Errorf("printer %q reported an offline error", address)
	}

	errorStatus, err := printer.TransmitErrorStatus()
	if err != nil {
		return fmt.Errorf("printer %q error status unavailable: %w", address, err)
	}

	switch {
	case errorStatus.UnRecoverable:
		return fmt.Errorf("printer %q has an unrecoverable error", address)
	case errorStatus.AutoRecoverable:
		return fmt.Errorf("printer %q has a recoverable error", address)
	case errorStatus.AutoCutter:
		return fmt.Errorf("printer %q auto-cutter error", address)
	}

	paperStatus, err := printer.TransmitPaperSensorStatus()
	if err != nil {
		return fmt.Errorf("printer %q paper status unavailable: %w", address, err)
	}

	if paperStatus.RollEnd {
		return fmt.Errorf("printer %q is out of paper", address)
	}

	return nil
}

func (p *PrintService) resolvePrinterAddress(printerName string) (string, error) {
	address, err := helpers.ResolvePrinterAddress(printerName)
	if err != nil {
		if errors.Is(err, helpers.ErrPrinterNotConfigured) {
			return "", nil
		}
		return "", err
	}
	return address, nil
}

// EnsurePrinterReady validates that the configured printer can print before creating tickets.
func (p *PrintService) EnsurePrinterReady(printerName string) error {
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		return nil
	})
}

// GetInstalledPrinters returns the configured Ethernet printer endpoint.
func (p *PrintService) GetInstalledPrinters() ([]string, error) {
	address, err := p.resolvePrinterAddress("")
	if err != nil {
		return nil, err
	}
	if address == "" {
		return []string{}, nil
	}

	return []string{address}, nil
}

// GetPrinterStatus returns "ready" when the Ethernet printer can print.
func (p *PrintService) GetPrinterStatus(printerName string) (string, error) {
	if err := p.EnsurePrinterReady(printerName); err != nil {
		return "", err
	}

	return "ready", nil
}

func (p *PrintService) printTicketReceipt(printer escpos.Printer, ticket models.Ticket) error {
	if err := printer.Initialize(); err != nil {
		return err
	}

	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}

	if ticket.IsGold {
		if err := printer.SelectPrintMode(escpos.Underline); err != nil {
			return err
		}
		if err := printer.Justify(escpos.CenterJustify); err != nil {
			return err
		}
		if err := printer.Println("TIQUETE DE ORO"); err != nil {
			return err
		}
	}

	if err := printer.LF(); err != nil {
		return err
	}

	if err := printer.Justify(escpos.CenterJustify); err != nil {
		return err
	}
	if err := printer.Println("TRANSPORTES"); err != nil {
		return err
	}
	if err := printer.Println("EL PUMA PARDO S.A"); err != nil {
		return err
	}
	if err := printer.Println("TEL: 2765-1349"); err != nil {
		return err
	}

	if err := printer.LF(); err != nil {
		return err
	}

	if err := printer.Justify(escpos.LeftJustify); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.Bold); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Print("Ruta:    "); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}
	if err := printer.Println(escposSafe(ticket.Destination)); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.Bold); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Print("Destino: "); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}
	if err := printer.Println(escposSafe(ticket.Stop)); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.Bold); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Print("Fecha:   "); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}
	if err := printer.Println(time.Now().Format("02/01/2006")); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.Bold); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Print("Hora:    "); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}
	if err := printer.Println(ticket.Time); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.Bold); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Print("Tarifa:  "); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 2); err != nil {
		return err
	}
	if err := printer.Println(strconv.Itoa(ticket.Fare)); err != nil {
		return err
	}

	if err := printer.LF(); err != nil {
		return err
	}
	if err := printer.FeedLines(1); err != nil {
		return err
	}

	if err := printer.Justify(escpos.CenterJustify); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(2, 1); err != nil {
		return err
	}
	if err := printer.Println("BUEN VIAJE"); err != nil {
		return err
	}

	if err := printer.LF(); err != nil {
		return err
	}

	if err := printer.SelectPrintMode(escpos.ThinFont); err != nil {
		return err
	}
	if err := printer.SetCharacterSize(1, 1); err != nil {
		return err
	}
	if err := printer.Justify(escpos.RightJustify); err != nil {
		return err
	}
	if err := printer.Println(fmt.Sprintf("%d", ticket.ID)); err != nil {
		return err
	}

	if err := printer.LF(); err != nil {
		return err
	}
	if err := printer.FeedLines(2); err != nil {
		return err
	}

	return printer.Cut()
}

// PrintTicket prints one ticket receipt (id, departure -> destination, time, fare, type).
func (p *PrintService) PrintTicket(ticket models.Ticket, printerName string) error {
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		return p.printTicketReceipt(printer, ticket)
	})
}

// PrintTickets prints multiple tickets in one session (open once, print all, close).
func (p *PrintService) PrintTickets(tickets []models.Ticket, printerName string) error {
	if len(tickets) == 0 {
		return nil
	}

	return p.printerSession(printerName, func(printer escpos.Printer) error {
		for _, ticket := range tickets {
			if err := p.printTicketReceipt(printer, ticket); err != nil {
				return err
			}
		}
		return nil
	})
}

// PrintReport prints a report summary receipt.
func (p *PrintService) PrintReport(report models.Report, printerName string) error {
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		if err := printer.Initialize(); err != nil {
			return err
		}
		if err := printer.Justify(escpos.CenterJustify); err != nil {
			return err
		}
		if err := printer.SetBold(true); err != nil {
			return err
		}
		if err := printer.Println("REPORTE"); err != nil {
			return err
		}
		if err := printer.SetBold(false); err != nil {
			return err
		}
		if err := printer.LF(); err != nil {
			return err
		}

		if err := printer.Justify(escpos.LeftJustify); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("ID: %d", report.ID)); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Usuario: %s", report.Username)); err != nil {
			return err
		}

		var timetable string
		if report.Timetable == enums.Holiday {
			timetable = "Feriado"
		} else {
			timetable = "Regular"
		}

		if err := printer.Println(fmt.Sprintf("Horario: %s", timetable)); err != nil {
			return err
		}
		if err := printer.Println("----------------------"); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Total tiquetes: %d", report.TotalTickets)); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Total efectivo: CRC %s", strconv.Itoa(report.TotalCash))); err != nil {
			return err
		}
		if err := printer.Println("----------------------"); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Regulares: %d - CRC %s", report.TotalRegular, strconv.Itoa(report.TotalRegularCash))); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Oro: %d - CRC %s", report.TotalGold, strconv.Itoa(report.TotalGoldCash))); err != nil {
			return err
		}
		if err := printer.Println(fmt.Sprintf("Anulados: %d - CRC %s", report.TotalNull, strconv.Itoa(report.TotalNullCash))); err != nil {
			return err
		}
		if err := printer.LF(); err != nil {
			return err
		}
		if err := printer.FeedLines(3); err != nil {
			return err
		}

		return printer.Cut()
	})
}

// Startup is a no-op for PrintService (required by Wails bindings if needed).
func (p *PrintService) Startup() {}
