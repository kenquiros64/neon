package models

// AppSettings is persisted in ~/.config/neon/app_settings.yaml (ticket print branding).
type AppSettings struct {
	PrintHeaderLine1 string `json:"print_header_line1" yaml:"print_header_line1"`
	PrintHeaderLine2 string `json:"print_header_line2" yaml:"print_header_line2"`
	PrintHeaderPhone string `json:"print_header_phone" yaml:"print_header_phone"`
	PrintFooter      string `json:"print_footer" yaml:"print_footer"`
}
