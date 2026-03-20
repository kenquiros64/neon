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

	printer.SetCharacterSize(1, 2)

	if ticket.IsGold {
		printer.SelectPrintMode(escpos.Underline)
		printer.Justify(escpos.CenterJustify)
		printer.Println("TIQUETE DE ORO")
	}

	printer.LF()

	printer.Justify(escpos.CenterJustify)
	printer.SetCharacterSize(1, 2)
	printer.Println("TRANSPORTES")
	printer.Println("EL PUMA PARDO S.A")
	printer.Println("TEL: 2765-1349")

	printer.LF()

	printer.Justify(escpos.LeftJustify)

	printer.SelectPrintMode(escpos.Bold)
	printer.SetCharacterSize(1, 1)
	printer.Print("Ruta:    ")

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Println(escposSafe(ticket.Destination))

	printer.SelectPrintMode(escpos.Bold)
	printer.SetCharacterSize(1, 1)
	printer.Print("Destino: ")

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Println(escposSafe(ticket.Stop))

	printer.SelectPrintMode(escpos.Bold)
	printer.SetCharacterSize(1, 1)
	printer.Print("Fecha:   ")

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Println(time.Now().Format("02/01/2006"))

	printer.SelectPrintMode(escpos.Bold)
	printer.SetCharacterSize(1, 1)
	printer.Print("Hora:    ")

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Println(ticket.Time)

	printer.SelectPrintMode(escpos.Bold)
	printer.SetCharacterSize(1, 1)
	printer.Print("Tarifa:  ")

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Println(strconv.Itoa(ticket.Fare))

	printer.LF()
	printer.FeedLines(1)

	printer.Justify(escpos.CenterJustify)
	printer.SetCharacterSize(2, 1)
	printer.Println("BUEN VIAJE")

	printer.LF()

	printer.SelectPrintMode(escpos.ThinFont)
	printer.SetCharacterSize(1, 1)
	printer.Justify(escpos.RightJustify)
	printer.Println(fmt.Sprintf("%d", ticket.ID))

	printer.LF()
	printer.FeedLines(2)

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

		printer.SelectPrintMode(escpos.ThinFont)
		printer.SetCharacterSize(1, 1)
		printer.Justify(escpos.CenterJustify)
		printer.SetBold(true)
		printer.Print(fmt.Sprintf("REPORTE %d", report.ID))
		printer.SetBold(false)
		printer.LF()

		printer.Justify(escpos.LeftJustify)
		printer.Println(fmt.Sprintf("Usuario:     %s", report.Username))

		if report.PartialClosedBy != nil {
			printer.Println(fmt.Sprintf("Parcial por: %s", *report.PartialClosedBy))
		}

		if report.ClosedBy != nil {
			printer.Println(fmt.Sprintf("Cerrado por: %s", *report.ClosedBy))
		}

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Justify(escpos.LeftJustify)

		var timetable string
		if report.Timetable == enums.Holiday {
			timetable = "Feriado"
		} else {
			timetable = "Regular"
		}

		if report.CreatedAt != nil {
			date, err := time.Parse(time.RFC3339, *report.CreatedAt)
			if err != nil {
				return err
			}
			printer.Println(fmt.Sprintf("Fecha:   %s", date.Format("02/01/2006 15:04:05")))
		}

		if report.PartialClosedAt != nil {
			date, err := time.Parse(time.RFC3339, *report.PartialClosedAt)
			if err != nil {
				return err
			}
			printer.Println(fmt.Sprintf("Parcial: %s", date.Format("02/01/2006 15:04:05")))
		}

		if report.ClosedAt != nil {
			date, err := time.Parse(time.RFC3339, *report.ClosedAt)
			if err != nil {
				return err
			}
			printer.Println(fmt.Sprintf("Cerrado: %s", date.Format("02/01/2006 15:04:05")))
		}

		printer.Println(fmt.Sprintf("Horario: %s", timetable))

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Justify(escpos.LeftJustify)

		printer.Println(fmt.Sprintf("Regulares: %d", report.TotalRegular))
		printer.Println(fmt.Sprintf("Total:     C %s", strconv.Itoa(report.TotalRegularCash)))

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Justify(escpos.LeftJustify)
		printer.Println(fmt.Sprintf("Oro:       %d", report.TotalGold))
		printer.Println(fmt.Sprintf("Total:     C %s", strconv.Itoa(report.TotalGoldCash)))

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Justify(escpos.LeftJustify)

		printer.Println(fmt.Sprintf("Anulados:  %d", report.TotalNull))
		printer.Println(fmt.Sprintf("Total:     C %s", strconv.Itoa(report.TotalNullCash)))

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Println("ENTREGAS")
		printer.Justify(escpos.LeftJustify)

		printer.Println(fmt.Sprintf("Parcial: C %s", strconv.Itoa(report.PartialCash)))
		printer.Println(fmt.Sprintf("Cierre:  C %s", strconv.Itoa(report.FinalCash)))
		printer.Println(fmt.Sprintf("Total:   C %s", strconv.Itoa(report.PartialCash+report.FinalCash)))

		printer.Justify(escpos.CenterJustify)
		printer.Println("--------------------------------")
		printer.Println("CIERRE")
		printer.Justify(escpos.LeftJustify)

		printer.Println(fmt.Sprintf("Vendidos:   %d", report.PartialTickets+report.FinalTickets))
		printer.Println(fmt.Sprintf("Total:      C %s", strconv.Itoa(report.PartialCashReceived+report.FinalCashReceived)))
		printer.Println(fmt.Sprintf("Diferencia: C %s", strconv.Itoa(report.PartialCashReceived+report.FinalCashReceived-report.PartialCash-report.FinalCash)))

		printer.LF()
		printer.FeedLines(4)

		return printer.Cut()
	})
}

// Startup is a no-op for PrintService (required by Wails bindings if needed).
func (p *PrintService) Startup() {}
