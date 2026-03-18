package helpers

import (
	"fmt"
	"net"
	"os"
	"strings"
)

const (
	// PrinterAddressEnv is the preferred environment variable for the printer TCP endpoint.
	PrinterAddressEnv = "PRINTER_ADDRESS"
	// LegacyPrinterDeviceEnv keeps backwards compatibility with the previous printer config.
	LegacyPrinterDeviceEnv = "PRINTER_DEVICE"
	defaultPrinterPort     = "9100"
)

// ResolvePrinterAddress resolves the configured Ethernet printer address.
func ResolvePrinterAddress(printerName string) (string, error) {
	address := strings.TrimSpace(printerName)
	if address == "" || strings.EqualFold(address, "default") {
		address = strings.TrimSpace(os.Getenv(PrinterAddressEnv))
	}
	if address == "" {
		address = strings.TrimSpace(os.Getenv(LegacyPrinterDeviceEnv))
	}
	if address == "" {
		return "", fmt.Errorf("%w: set %s or %s", ErrPrinterNotConfigured, PrinterAddressEnv, LegacyPrinterDeviceEnv)
	}

	normalizedAddress, err := normalizePrinterAddress(address)
	if err != nil {
		return "", fmt.Errorf("invalid printer address %q: %w", address, err)
	}

	return normalizedAddress, nil
}

func normalizePrinterAddress(address string) (string, error) {
	if host, port, err := net.SplitHostPort(address); err == nil {
		if strings.TrimSpace(host) == "" || strings.TrimSpace(port) == "" {
			return "", fmt.Errorf("host and port are required")
		}
		return net.JoinHostPort(host, port), nil
	}

	if net.ParseIP(address) != nil || !strings.Contains(address, ":") {
		return net.JoinHostPort(address, defaultPrinterPort), nil
	}

	return "", fmt.Errorf("missing or invalid TCP port")
}
