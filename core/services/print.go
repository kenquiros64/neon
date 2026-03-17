package services

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
	"strconv"

	"github.com/DevLumuz/go-escpos"

	"neon/core/helpers/enums"
	"neon/core/models"
)

// lpWriteCloser wraps an lp process stdin for ESC/POS raw output. Implements io.ReadWriteCloser
// (Read returns 0, io.EOF so escpos.NewPrinter can use it).
type lpWriteCloser struct {
	cmd   *exec.Cmd
	stdin io.WriteCloser
}

func (w *lpWriteCloser) Write(p []byte) (n int, err error) { return w.stdin.Write(p) }
func (w *lpWriteCloser) Read(_ []byte) (n int, err error)  { return 0, io.EOF }
func (w *lpWriteCloser) Close() error {
	if err := w.stdin.Close(); err != nil {
		return err
	}
	return w.cmd.Wait()
}

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
		// macOS / linux: use lp -d "<printer_name>" -o raw - (printer name from PRINTER_DEVICE or default)
		name := printerName
		if name == "" || name == "default" {
			name = os.Getenv("PRINTER_DEVICE")
		}
		if name == "" {
			name = "EPSON_TM_T20IV_SP"
		}
		cmd := exec.Command("lp", "-d", name, "-o", "raw", "-")
		stdin, errPipe := cmd.StdinPipe()
		if errPipe != nil {
			return fmt.Errorf("lp stdin: %w", errPipe)
		}
		if err = cmd.Start(); err != nil {
			return fmt.Errorf("lp -d %q: %w", name, err)
		}
		printer = escpos.NewPrinter(&lpWriteCloser{cmd: cmd, stdin: stdin})
		// printer.Close() will close the wrapper, which closes stdin and waits for lp
	}

	defer func() { _ = printer.Close() }()
	return fn(printer)
}

// GetInstalledPrinters returns the list of printer names to use (Windows: system list; macOS: lp printer name from PRINTER_DEVICE or default).
// On macOS, uses lp -d "<name>" -o raw -; PRINTER_DEVICE can set the queue name, else "EPSON_TM_T20IV_SP" is used.
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
	name := os.Getenv("PRINTER_DEVICE")
	if name == "" {
		name = "EPSON_TM_T20IV_SP"
	}
	return []string{name}, nil
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
