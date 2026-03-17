package services

import (
	"fmt"
	"os"
	"runtime"
	"strconv"

	"github.com/DevLumuz/go-escpos"

	"neon/core/helpers/enums"
	"neon/core/models"
)

// PrintService handles thermal receipt printing for tickets and reports (Windows + macOS).
type PrintService struct{}

// NewPrintService creates a new print service.
func NewPrintService() *PrintService {
	return &PrintService{}
}

// printerSession opens a printer, runs fn, and closes it. Caller does not close.
func (p *PrintService) printerSession(printerName string, fn func(printer escpos.Printer) error) error {
	var printer escpos.Printer
	var err error

	switch runtime.GOOS {
	case "windows":
		printer, err = escpos.NewWindowsPrinter(printerName)
		if err != nil {
			return fmt.Errorf("printer %q: %w", printerName, err)
		}
	default:
		// macOS / linux: printerName is device path (e.g. /dev/usb/lp0) or use PRINTER_DEVICE env
		device := printerName
		if device == "" || device == "default" {
			device = os.Getenv("PRINTER_DEVICE")
		}
		if device == "" {
			device = "EPSON_TM_T20IV_SP" // fallback label; may not exist
		}
		f, errOpen := os.OpenFile(device, os.O_WRONLY, 0)
		if errOpen != nil {
			return fmt.Errorf("printer device %q: %w", device, errOpen)
		}
		defer f.Close()
		printer = escpos.NewPrinter(f)
	}

	defer func() { _ = printer.Close() }()
	return fn(printer)
}

// GetInstalledPrinters returns the list of printer names to use (Windows: system list; macOS: default from env).
func (p *PrintService) GetInstalledPrinters() ([]string, error) {
	if runtime.GOOS == "windows" {
		list, err := escpos.GetInstalledPrinters()
		if err != nil {
			return nil, fmt.Errorf("get printers: %w", err)
		}
		if len(list) == 0 {
			return nil, fmt.Errorf("no printers installed")
		}
		return list, nil
	}
	device := os.Getenv("PRINTER_DEVICE")
	if device == "" {
		return []string{"default"}, nil
	}
	return []string{device}, nil
}

// GetPrinterStatus returns a short status string and any error.
// If the printer can be opened and initialized, returns "ready". Otherwise returns "" and the error
// (e.g. printer offline, no paper, disconnected).
func (p *PrintService) GetPrinterStatus(printerName string) (string, error) {
	err := p.printerSession(printerName, func(printer escpos.Printer) error {
		return printer.Initialize()
	})
	if err != nil {
		return "", err
	}
	return "ready", nil
}

// PrintTicket prints one ticket receipt (id, departure -> destination, time, fare, type).
func (p *PrintService) PrintTicket(ticket models.Ticket, printerName string) error {
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		printer.Initialize()

		printer.Justify(escpos.CenterJustify)
		printer.SetBold(true)
		printer.Println("TICKET")
		printer.SetBold(false)
		printer.LF()

		printer.Justify(escpos.LeftJustify)
		printer.Println(fmt.Sprintf("ID: %d", ticket.ID))
		printer.Println(fmt.Sprintf("%s -> %s", ticket.Departure, ticket.Destination))
		printer.Println(fmt.Sprintf("Hora: %s", ticket.Time))
		ticketType := "Regular"
		if ticket.IsGold {
			ticketType = "Oro"
		}
		printer.Println(fmt.Sprintf("Tipo: %s", ticketType))
		printer.Println(fmt.Sprintf("Tarifa: ₡%s", strconv.Itoa(ticket.Fare)))
		if ticket.Stop != "" {
			printer.Println(fmt.Sprintf("Parada: %s", ticket.Stop))
		}
		printer.LF()

		printer.FeedLines(2)
		printer.Cut()
		return nil
	})
}

// PrintTickets prints multiple tickets in one session (open once, print all, close).
func (p *PrintService) PrintTickets(tickets []models.Ticket, printerName string) error {
	if len(tickets) == 0 {
		return nil
	}
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		for i, ticket := range tickets {
			printer.Initialize()
			printer.Justify(escpos.CenterJustify)
			printer.SetBold(true)
			printer.Println("TICKET")
			printer.SetBold(false)
			printer.LF()
			printer.Justify(escpos.LeftJustify)
			printer.Println(fmt.Sprintf("ID: %d", ticket.ID))
			printer.Println(fmt.Sprintf("%s -> %s", ticket.Departure, ticket.Destination))
			printer.Println(fmt.Sprintf("Hora: %s", ticket.Time))
			ticketType := "Regular"
			if ticket.IsGold {
				ticketType = "Oro"
			}
			printer.Println(fmt.Sprintf("Tipo: %s", ticketType))
			printer.Println(fmt.Sprintf("Tarifa: ₡%s", strconv.Itoa(ticket.Fare)))
			if ticket.Stop != "" {
				printer.Println(fmt.Sprintf("Parada: %s", ticket.Stop))
			}
			printer.LF()
			if i < len(tickets)-1 {
				printer.FeedLines(1)
			}
		}
		printer.FeedLines(2)
		printer.Cut()
		return nil
	})
}

// PrintReport prints a report summary receipt.
func (p *PrintService) PrintReport(report models.Report, printerName string) error {
	return p.printerSession(printerName, func(printer escpos.Printer) error {
		printer.Initialize()

		printer.Justify(escpos.CenterJustify)
		printer.SetBold(true)
		printer.Println("REPORTE")
		printer.SetBold(false)
		printer.LF()

		printer.Justify(escpos.LeftJustify)
		printer.Println(fmt.Sprintf("ID: %d", report.ID))
		printer.Println(fmt.Sprintf("Usuario: %s", report.Username))

		var timetable string
		if report.Timetable == enums.Holiday {
			timetable = "Feriado"
		} else {
			timetable = "Regular"
		}
		printer.Println(fmt.Sprintf("Horario: %s", timetable))
		printer.Println("----------------------")
		printer.Println(fmt.Sprintf("Total tiquetes: %d", report.TotalTickets))
		printer.Println(fmt.Sprintf("Total efectivo: ₡%s", strconv.Itoa(report.TotalCash)))
		printer.Println("----------------------")
		printer.Println(fmt.Sprintf("Regulares: %d - ₡%s", report.TotalRegular, strconv.Itoa(report.TotalRegularCash)))
		printer.Println(fmt.Sprintf("Oro: %d - ₡%s", report.TotalGold, strconv.Itoa(report.TotalGoldCash)))
		printer.Println(fmt.Sprintf("Anulados: %d - ₡%s", report.TotalNull, strconv.Itoa(report.TotalNullCash)))
		printer.LF()

		printer.FeedLines(3)
		printer.Cut()
		return nil
	})
}

// Startup is a no-op for PrintService (required by Wails bindings if needed).
func (p *PrintService) Startup() {}
