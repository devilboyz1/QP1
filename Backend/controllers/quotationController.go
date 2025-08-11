package controllers

import (
	"bytes"
	"qp1/database"
	"qp1/models"
	"qp1/utils"

	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
)

// CreateQuotationRequest represents the request structure for creating a quotation
type CreateQuotationRequest struct {
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Items       []QuotationItemRequest `json:"items"`
}

// QuotationItemRequest represents an item in the quotation request
type QuotationItemRequest struct {
	ComponentID uint    `json:"component_id"`
	Length      float64 `json:"length"`
	Width       float64 `json:"width"`
	Height      float64 `json:"height"`
	Quantity    int     `json:"quantity"`
}

// CreateQuotation creates a new quotation with calculated costs
func CreateQuotation(c *fiber.Ctx) error {
	var req CreateQuotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	if req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Quotation title is required"})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "At least one item is required"})
	}

	// Get user ID from context (set by RequireUser middleware)
	userID := c.Locals("user").(models.User).ID

	// Start a transaction
	tx := database.DB.Begin()

	// Generate quotation number
	quotationNo, err := utils.GenerateQuotationNo()
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate quotation number"})
	}

	// Create the quotation
	quotation := models.Quotation{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Status:      "draft",
		TotalCost:   0, // Will be calculated below
		QuotationNo: quotationNo,
	}

	if err := tx.Create(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quotation"})
	}

	// Process each item and calculate costs
	totalQuotationCost := 0.0
	materialMap := make(map[uint]float64) // materialID -> total quantity

	for _, itemReq := range req.Items {
		// Verify component exists
		var component models.Component
		if err := tx.Preload("Materials.Material").First(&component, itemReq.ComponentID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Component not found"})
		}

		// Calculate volume multiplier based on dimensions
		volumeMultiplier := itemReq.Length * itemReq.Width * itemReq.Height

		// Calculate unit cost for this item (component cost * volume multiplier)
		itemUnitCost := component.TotalCost * volumeMultiplier
		itemTotalCost := itemUnitCost * float64(itemReq.Quantity)

		// Create quotation item
		quotationItem := models.QuotationItem{
			QuotationID: quotation.ID,
			ComponentID: itemReq.ComponentID,
			Length:      itemReq.Length,
			Width:       itemReq.Width,
			Height:      itemReq.Height,
			Quantity:    itemReq.Quantity,
			UnitCost:    itemUnitCost,
			TotalCost:   itemTotalCost,
		}

		if err := tx.Create(&quotationItem).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quotation item"})
		}

		// Accumulate material quantities
		for _, compMaterial := range component.Materials {
			materialID := compMaterial.MaterialID
			materialQuantity := compMaterial.Quantity * volumeMultiplier * float64(itemReq.Quantity)

			if existingQty, exists := materialMap[materialID]; exists {
				materialMap[materialID] = existingQty + materialQuantity
			} else {
				materialMap[materialID] = materialQuantity
			}
		}

		totalQuotationCost += itemTotalCost
	}

	// Create quotation materials from accumulated quantities
	for materialID, totalQuantity := range materialMap {
		// Get material details
		var material models.Material
		if err := tx.First(&material, materialID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Material not found"})
		}

		// Create quotation material
		quotationMaterial := models.QuotationMaterial{
			QuotationID:  quotation.ID,
			MaterialID:   materialID,
			MaterialName: material.Name,
			Unit:         material.Unit,
			UnitCost:     material.UnitCost,
			Quantity:     totalQuantity,
			TotalCost:    material.UnitCost * totalQuantity,
		}

		if err := tx.Create(&quotationMaterial).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quotation material"})
		}
	}

	// Update quotation with total cost
	quotation.TotalCost = totalQuotationCost
	if err := tx.Save(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update quotation cost"})
	}

	// Commit transaction
	tx.Commit()

	// Fetch the complete quotation with all relationships
	var completeQuotation models.Quotation
	database.DB.Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&completeQuotation, quotation.ID)

	return c.JSON(completeQuotation)
}

// ListQuotations retrieves all quotations for the current user
func ListQuotations(c *fiber.Ctx) error {
	userID := c.Locals("user").(models.User).ID

	var quotations []models.Quotation
	if err := database.DB.Where("user_id = ?", userID).
		Preload("Items.Component").
		Preload("Materials.Material").
		Order("created_at DESC").
		Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch quotations"})
	}

	return c.JSON(quotations)
}

// GetQuotation retrieves a specific quotation with all details
func GetQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quotation not found"})
	}

	return c.JSON(quotation)
}

// DeleteQuotation deletes a quotation (only if it's a draft)
func DeleteQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	// Check if quotation exists and belongs to user
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quotation not found"})
	}

	// Only allow deletion of draft quotations
	if quotation.Status != "draft" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only draft quotations can be deleted"})
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Delete quotation materials first
	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationMaterial{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete quotation materials"})
	}

	// Delete quotation items
	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete quotation items"})
	}

	// Delete the quotation
	if err := tx.Delete(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete quotation"})
	}

	// Commit transaction
	tx.Commit()

	return c.JSON(fiber.Map{"message": "Quotation deleted successfully"})
}

// UpdateQuotationStatus allows updating the status of a quotation
func UpdateQuotationStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	var req struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// Validate status
	validStatuses := []string{"draft", "issued", "accepted", "rejected"}
	isValid := false
	for _, status := range validStatuses {
		if req.Status == status {
			isValid = true
			break
		}
	}
	if !isValid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid status"})
	}

	// Update quotation status
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quotation not found"})
	}

	quotation.Status = req.Status
	if err := database.DB.Save(&quotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update quotation status"})
	}

	return c.JSON(quotation)
}

// UpdateQuotation allows a user to edit their quotation (only if it's a draft)
func UpdateQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quotation not found"})
	}
	if quotation.Status != "draft" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only draft quotations can be updated"})
	}

	var req CreateQuotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// You may want to delete old items/materials and re-create them, or update in place.
	// For simplicity, here we only update title/description.
	quotation.Title = req.Title
	quotation.Description = req.Description
	if err := database.DB.Save(&quotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update quotation"})
	}
	return c.JSON(quotation)
}

// ListAllQuotations allows admin to view all quotations
func ListAllQuotations(c *fiber.Ctx) error {
	var quotations []models.Quotation
	if err := database.DB.
		Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		Order("created_at DESC").
		Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch quotations"})
	}
	return c.JSON(quotations)
}

// DuplicateQuotation allows a user to copy an existing quotation
func DuplicateQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	var original models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("Items").
		Preload("Materials").
		First(&original).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Original quotation not found"})
	}

	// Generate new quotation number
	quotationNo, err := utils.GenerateQuotationNo()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate quotation number"})
	}

	// Duplicate quotation
	newQuotation := original
	newQuotation.ID = 0
	newQuotation.QuotationNo = quotationNo
	newQuotation.Status = "draft"
	if err := database.DB.Create(&newQuotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to duplicate quotation"})
	}

	// Duplicate items
	for _, item := range original.Items {
		newItem := item
		newItem.ID = 0
		newItem.QuotationID = newQuotation.ID
		if err := database.DB.Create(&newItem).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to duplicate quotation item"})
		}
	}

	// Duplicate materials
	for _, m := range original.Materials {
		newMaterial := m
		newMaterial.ID = 0
		newMaterial.QuotationID = newQuotation.ID
		if err := database.DB.Create(&newMaterial).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to duplicate quotation material"})
		}
	}

	return c.JSON(newQuotation)
}

func GenerateQuotationPDF(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user").(models.User).ID

	// Load the quotation with all details
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Quotation not found"})
	}

	// Create PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Quotation: "+quotation.QuotationNo)
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "Title: "+quotation.Title)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Customer: "+quotation.User.Name)
	pdf.Ln(8)
	pdf.Cell(40, 10, "Date: "+quotation.CreatedAt.Format("2006-01-02"))
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Components")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	for _, item := range quotation.Items {
		pdf.Cell(0, 8, "- "+item.Component.Name+" (Qty: "+strconv.Itoa(item.Quantity)+")")
		pdf.Ln(7)
	}
	pdf.Ln(5)
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Material Breakdown")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	for _, m := range quotation.Materials {
		pdf.Cell(0, 8, "- "+m.MaterialName+" ("+m.Unit+"): "+strconv.FormatFloat(m.Quantity, 'f', 2, 64)+" x "+strconv.FormatFloat(m.UnitCost, 'f', 2, 64))
		pdf.Ln(7)
	}
	pdf.Ln(10)
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Total Cost: "+strconv.FormatFloat(quotation.TotalCost, 'f', 2, 64))

	// Output PDF to buffer
	var buf bytes.Buffer
	err := pdf.Output(&buf)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate PDF"})
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "inline; filename=\"quotation_"+quotation.QuotationNo+".pdf\"")
	return c.SendStream(&buf)
}

// SearchQuotations allows searching quotations by client, date, or status
func SearchQuotations(c *fiber.Ctx) error {
	client := c.Query("client")
	status := c.Query("status")
	date := c.Query("date") // expected format: YYYY-MM-DD

	var quotations []models.Quotation
	query := database.DB.Preload("User")

	if client != "" {
		query = query.Joins("JOIN users ON users.id = quotations.user_id").Where("users.name LIKE ?", "%"+client+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if date != "" {
		query = query.Where("DATE(quotations.created_at) = ?", date)
	}

	if err := query.Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to search quotations"})
	}
	return c.JSON(quotations)
}

// GenerateSalesReport generates a sales report for all quotations
func GenerateSalesReport(c *fiber.Ctx) error {
	var quotations []models.Quotation
	if err := database.DB.Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch quotations"})
	}
	report := utils.GenerateSalesReport(quotations)
	return c.JSON(report)
}

// GenerateMaterialUsageReport generates a material usage report for all materials
func GenerateMaterialUsageReport(c *fiber.Ctx) error {
	var materials []models.Material
	if err := database.DB.Find(&materials).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch materials"})
	}
	report := utils.GenerateMaterialUsageReport(materials)
	return c.JSON(report)
}
