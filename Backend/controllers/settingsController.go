package controllers

import (
	"qp1/database"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
)

// UpdateCompanyInfo updates company name, address, and logo
func UpdateCompanyInfo(c *fiber.Ctx) error {
	var data struct {
		Name    string `json:"name"`
		Address string `json:"address"`
		Logo    string `json:"logo"` // Could be a URL or base64 string
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var settings models.Settings
	database.DB.First(&settings)
	settings.CompanyName = data.Name
	settings.CompanyAddress = data.Address
	settings.CompanyLogo = data.Logo
	if err := database.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update company info"})
	}
	return c.JSON(settings)
}

// UpdateTaxSettings updates the tax rate
func UpdateTaxSettings(c *fiber.Ctx) error {
	var data struct {
		TaxRate float64 `json:"tax_rate"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var settings models.Settings
	database.DB.First(&settings)
	settings.TaxRate = data.TaxRate
	if err := database.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update tax settings"})
	}
	return c.JSON(settings)
}

// UpdateCurrencySettings updates the currency
func UpdateCurrencySettings(c *fiber.Ctx) error {
	var data struct {
		Currency string `json:"currency"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var settings models.Settings
	database.DB.First(&settings)
	settings.Currency = data.Currency
	if err := database.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update currency settings"})
	}
	return c.JSON(settings)
}

// UpdateQuotationNumberFormat updates the quotation number prefix/format
func UpdateQuotationNumberFormat(c *fiber.Ctx) error {
	var data struct {
		QuotationNoFormat string `json:"quotation_no_format"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var settings models.Settings
	database.DB.First(&settings)
	settings.QuotationNoFormat = data.QuotationNoFormat
	if err := database.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update quotation number format"})
	}
	return c.JSON(settings)
}

// UpdateTermsAndConditions updates the default terms and conditions text
func UpdateTermsAndConditions(c *fiber.Ctx) error {
	var data struct {
		Terms string `json:"terms"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	var settings models.Settings
	database.DB.First(&settings)
	settings.TermsAndConditions = data.Terms
	if err := database.DB.Save(&settings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update terms and conditions"})
	}
	return c.JSON(settings)
}
