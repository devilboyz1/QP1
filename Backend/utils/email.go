package utils

import (
	"fmt"
	"net/smtp"
)

// EmailConfig holds SMTP server config
type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

// EmailQuotationToClient sends the quotation PDF to the client's email
func EmailQuotationToClient(cfg EmailConfig, to string, subject string, body string, pdfData []byte) error {
	// Set up authentication information.
	auth := smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)

	// Construct the email headers and body (simple version, no attachment encoding)
	msg := "From: " + cfg.From + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n" +
		"MIME-Version: 1.0\n" +
		"Content-Type: application/pdf\n" +
		"Content-Disposition: attachment; filename=\"quotation.pdf\"\n\n"

	// Combine headers and PDF data
	message := append([]byte(msg), pdfData...)

	addr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	return smtp.SendMail(addr, auth, cfg.From, []string{to}, message)
}
