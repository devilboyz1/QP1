package utils

import (
	"bytes"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
)

// GenerateQuotationPDF generates a PDF as bytes for a given quotation
func GenerateQuotationPDF(quotation *models.Quotation) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Quotation")
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "Quotation No: "+quotation.QuotationNo)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Title: "+quotation.Title)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Description: "+quotation.Description)
	pdf.Ln(8)
	// Add more fields as needed...

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// DownloadQuotationPDF writes the PDF to the HTTP response for download
func DownloadQuotationPDF(c *fiber.Ctx, quotation *models.Quotation) error {
	pdfBytes, err := GenerateQuotationPDF(quotation)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to generate PDF")
	}
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment; filename=quotation.pdf")
	return c.Send(pdfBytes)
}
