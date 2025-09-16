package controllers

import (
	"qp1/database"
	"qp1/models"
	"qp1/utils"
	

	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// Enhanced request structures
type CreateQuotationRequest struct {
	Title       string                       `json:"title" validate:"required,min=1,max=255"`
	Description string                       `json:"description" validate:"max=1000"`
	ClientName  string                       `json:"client_name,omitempty"`
	Items       []CreateQuotationItemRequest `json:"items" validate:"required,min=1"`
}

type CreateQuotationItemRequest struct {
	ComponentID uint    `json:"component_id" validate:"required"`
	Length      float64 `json:"length" validate:"required,min=0.1"`
	Width       float64 `json:"width" validate:"required,min=0.1"`
	Height      float64 `json:"height" validate:"required,min=0.1"`
	Quantity    int     `json:"quantity" validate:"required,min=1"`
	Notes       string  `json:"notes" validate:"max=255"`
}

// Validation response structure
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type APIResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Data    interface{}       `json:"data,omitempty"`
	Errors  []ValidationError `json:"errors,omitempty"`
}

// Enhanced CreateQuotation with comprehensive validation
func CreateQuotation(c *fiber.Ctx) error {
	var req CreateQuotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid request format",
			Errors:  []ValidationError{{Field: "body", Message: "Failed to parse request body"}},
		})
	}

	// Validate request
	if validationErrors := validateCreateQuotationRequest(req); len(validationErrors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  validationErrors,
		})
	}

	// Extract user ID from context
	userData := c.Locals("user").(models.User)
	userID := uint(userData.ID)

	// Start transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Generate quotation number
	quotationNo, err := utils.GenerateQuotationNo()
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to generate quotation number",
		})
	}

	// Create quotation
	quotation := models.Quotation{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		ClientName:  utils.SanitizeClientName(req.ClientName),
		Status:      "draft",
		TotalCost:   decimal.NewFromFloat(0),
		QuotationNo: quotationNo,
	}

	// ClientID field removed from model

	if createErr := tx.Create(&quotation).Error; createErr != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to create quotation",
		})
	}

	// Process items with enhanced error handling
	totalCost, err := processQuotationItems(tx, quotation.ID, req.Items)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Update total cost
	quotation.TotalCost = decimal.NewFromFloat(totalCost)
	if err := tx.Save(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to update quotation total",
		})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to save quotation",
		})
	}

	// Fetch complete quotation
	var completeQuotation models.Quotation
	database.DB.Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&completeQuotation, quotation.ID)

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Message: "Quotation created successfully",
		Data:    completeQuotation,
	})
}

// New SaveQuotationDraft function for partial saves
func SaveQuotationDraft(c *fiber.Ctx) error {
	var req CreateQuotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid request format: " + err.Error(),
		})
	}

	// Enhanced validation for special characters
	if req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Title is required",
			Errors:  []ValidationError{{Field: "title", Message: "Title cannot be empty"}},
		})
	}

	// Validate text fields for potential JSON issues
	if len(req.Title) > 255 {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Title too long",
			Errors:  []ValidationError{{Field: "title", Message: "Title must be less than 255 characters"}},
		})
	}

	// Extract user ID from context
	userData := c.Locals("user").(models.User)
	userID := uint(userData.ID)

	// Check if this is an update to existing draft
	quotationID := c.Params("id")
	if quotationID != "" {
		return updateExistingDraft(c, quotationID, req, uint(userID))
	}

	// Create new draft
	return createNewDraft(c, req, uint(userID))
}

// Helper functions
func validateCreateQuotationRequest(req CreateQuotationRequest) []ValidationError {
	var errors []ValidationError

	if req.Title == "" {
		errors = append(errors, ValidationError{Field: "title", Message: "Title is required"})
	}
	if len(req.Title) > 255 {
		errors = append(errors, ValidationError{Field: "title", Message: "Title must be less than 255 characters"})
	}
	if len(req.Description) > 1000 {
		errors = append(errors, ValidationError{Field: "description", Message: "Description must be less than 1000 characters"})
	}
	if len(req.Items) == 0 {
		errors = append(errors, ValidationError{Field: "items", Message: "At least one item is required"})
	}
	
	
	// Validate client name
	if len(req.ClientName) > 100 {
		errors = append(errors, ValidationError{Field: "client_name", Message: "Client name must be less than 100 characters"})
	}

	// Validate items
	for i, item := range req.Items {
		if item.ComponentID == 0 {
			errors = append(errors, ValidationError{
				Field:   fmt.Sprintf("items[%d].component_id", i),
				Message: "Component ID is required",
			})
		}
		if item.Length <= 0 {
			errors = append(errors, ValidationError{
				Field:   fmt.Sprintf("items[%d].length", i),
				Message: "Length must be greater than 0",
			})
		}
		if item.Width <= 0 {
			errors = append(errors, ValidationError{
				Field:   fmt.Sprintf("items[%d].width", i),
				Message: "Width must be greater than 0",
			})
		}
		if item.Height <= 0 {
			errors = append(errors, ValidationError{
				Field:   fmt.Sprintf("items[%d].height", i),
				Message: "Height must be greater than 0",
			})
		}
		if item.Quantity <= 0 {
			errors = append(errors, ValidationError{
				Field:   fmt.Sprintf("items[%d].quantity", i),
				Message: "Quantity must be greater than 0",
			})
		}
	}

	return errors
}

func processQuotationItems(tx *gorm.DB, quotationID uint, items []CreateQuotationItemRequest) (float64, error) {
	totalCost := 0.0
	materialMap := make(map[uint]float64)

	for _, itemReq := range items {
		// Verify component exists
		var component models.Component
		if err := tx.Preload("Materials.Material").First(&component, itemReq.ComponentID).Error; err != nil {
			return 0, fmt.Errorf("component with ID %d not found", itemReq.ComponentID)
		}

		// Calculate costs
		volumeMultiplier := itemReq.Length * itemReq.Width * itemReq.Height
		itemUnitCost := component.TotalCost * volumeMultiplier
		itemTotalCost := itemUnitCost * float64(itemReq.Quantity)

		// Create quotation item
		quotationItem := models.QuotationItem{
			QuotationID: quotationID,
			ComponentID: itemReq.ComponentID,
			Length:      itemReq.Length,
			Width:       itemReq.Width,
			Height:      itemReq.Height,
			Quantity:    itemReq.Quantity,
			UnitCost:    itemUnitCost,
			TotalCost:   itemTotalCost,
		}

		if err := tx.Create(&quotationItem).Error; err != nil {
			return 0, fmt.Errorf("failed to create quotation item: %v", err)
		}

		// Accumulate materials
		for _, compMaterial := range component.Materials {
			materialID := compMaterial.MaterialID
			materialQuantity := compMaterial.Quantity * volumeMultiplier * float64(itemReq.Quantity)
			materialMap[materialID] += materialQuantity
		}

		totalCost += itemTotalCost
	}

	// Create quotation materials
	for materialID, totalQuantity := range materialMap {
		var material models.Material
		if err := tx.First(&material, materialID).Error; err != nil {
			return 0, fmt.Errorf("material with ID %d not found", materialID)
		}

		quotationMaterial := models.QuotationMaterial{
			QuotationID:  quotationID,
			MaterialID:   materialID,
			MaterialName: material.Name,
			Unit:         material.Unit,
			UnitCost:     material.UnitCost,
			Quantity:     totalQuantity,
			TotalCost:    material.UnitCost * totalQuantity,
		}

		if err := tx.Create(&quotationMaterial).Error; err != nil {
			return 0, fmt.Errorf("failed to create quotation material: %v", err)
		}
	}

	return totalCost, nil
}

func createNewDraft(c *fiber.Ctx, req CreateQuotationRequest, userID uint) error {
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	quotationNo, err := utils.GenerateQuotationNo()
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to generate quotation number",
		})
	}

	quotation := models.Quotation{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		ClientName:  utils.SanitizeClientName(req.ClientName),
		Status:      "draft",
		TotalCost:   decimal.NewFromFloat(0),
		QuotationNo: quotationNo,
	}

	if err := tx.Create(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to create draft",
		})
	}

	// Process items if any
	if len(req.Items) > 0 {
		totalCost, err := processQuotationItems(tx, quotation.ID, req.Items)
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Message: err.Error(),
			})
		}
		quotation.TotalCost = decimal.NewFromFloat(totalCost)
		if err := tx.Save(&quotation).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Message: "Failed to update draft total",
			})
		}
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to save draft",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Success: true,
		Message: "Draft saved successfully",
		Data:    quotation,
	})
}

func updateExistingDraft(c *fiber.Ctx, quotationID string, req CreateQuotationRequest, userID uint) error {
	id, err := strconv.ParseUint(quotationID, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Verify quotation exists and belongs to user
	var quotation models.Quotation
	if err := tx.Where("id = ? AND user_id = ? AND status = ?", id, userID, "draft").First(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Message: "Draft quotation not found",
		})
	}

	// Clear existing items and materials
	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to clear existing items",
		})
	}
	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationMaterial{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to clear existing materials",
		})
	}

	// Update quotation details
	quotation.Title = req.Title
	quotation.Description = req.Description
	quotation.ClientName = utils.SanitizeClientName(req.ClientName)
	quotation.TotalCost = decimal.NewFromFloat(0)

	// Process new items
	if len(req.Items) > 0 {
		totalCost, err := processQuotationItems(tx, quotation.ID, req.Items)
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
				Success: false,
				Message: err.Error(),
			})
		}
		quotation.TotalCost = decimal.NewFromFloat(totalCost)
	}

	if err := tx.Save(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to update draft",
		})
	}

	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to save draft",
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Message: "Draft updated successfully",
		Data:    quotation,
	})
}

func UpdateQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := c.Locals("user_id").(uint)

	// Validate quotation ID
	quotationID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	// Check if quotation exists and belongs to user
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", quotationID, userID).First(&quotation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(APIResponse{
				Success: false,
				Message: "Quotation not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Database error",
		})
	}

	// Check if quotation can be updated (only drafts can be updated)
	if quotation.Status != "draft" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Only draft quotations can be updated",
		})
	}

	// Parse and validate request
	var req CreateQuotationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid request format",
		})
	}

	// Validate request data
	if validationErrors := validateCreateQuotationRequest(req); len(validationErrors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Validation failed",
			Errors:  validationErrors,
		})
	}

	// Start transaction with proper error handling
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r) // Re-panic after rollback
		}
	}()

	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to start transaction",
		})
	}

	// Clear existing items and materials with proper error handling
	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to clear existing items",
		})
	}

	if err := tx.Where("quotation_id = ?", quotation.ID).Delete(&models.QuotationMaterial{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to clear existing materials",
		})
	}

	// Update quotation basic information
	quotation.Title = req.Title
	quotation.Description = req.Description
	quotation.ClientName = utils.SanitizeClientName(req.ClientName)
	quotation.TotalCost = decimal.NewFromFloat(0) // Will be recalculated

	// Process new items and calculate costs
	totalCost, err := processQuotationItems(tx, quotation.ID, req.Items)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to process items: %s", err.Error()),
		})
	}

	// Update quotation with calculated totals
	quotation.TotalCost = decimal.NewFromFloat(totalCost)
	if err := tx.Save(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to update quotation",
		})
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to save quotation updates",
		})
	}

	// Fetch updated quotation with all relationships
	var updatedQuotation models.Quotation
	if err := database.DB.Where("id = ?", quotation.ID).
		Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&updatedQuotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve updated quotation",
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotation updated successfully",
		Data: fiber.Map{
			"quotation": updatedQuotation,
		},
	})
}

// GetQuotation retrieves a single quotation by ID
func GetQuotation(c *fiber.Ctx) error {
	id := c.Params("id")
	userData := c.Locals("user").(models.User)
	userID := uint(userData.ID)

	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("User").
		Preload("Items.Component").
		Preload("Materials.Material").
		First(&quotation).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(APIResponse{
			Success: false,
			Message: "Quotation not found",
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotation retrieved successfully",
		Data:    quotation,
	})
}

// ListQuotations retrieves all quotations for the current user with pagination
func ListQuotations(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Parse pagination parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	// Parse status filter
	status := c.Query("status")

	var quotations []models.Quotation
	var total int64

	// Build query
	query := database.DB.Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Get total count
	if err := query.Model(&models.Quotation{}).Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to count quotations",
		})
	}

	// Get quotations with relationships
	if err := query.Preload("User").Preload("Items.Component").Preload("Materials.Material").
		Order("created_at DESC").Offset(offset).Limit(limit).Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve quotations",
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotations retrieved successfully",
		Data: fiber.Map{
			"quotations":  quotations,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		},
	})
}

// DeleteQuotation soft deletes a quotation
func DeleteQuotation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	quotationID := c.Params("id")

	// Validate quotation ID
	id, err := strconv.ParseUint(quotationID, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	// Check if quotation exists and belongs to user
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&quotation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(APIResponse{
				Success: false,
				Message: "Quotation not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Database error",
		})
	}

	// Check if quotation can be deleted (only drafts can be deleted)
	if quotation.Status != "draft" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Only draft quotations can be deleted",
		})
	}

	// Start transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete related items and materials
	if err := tx.Where("quotation_id = ?", id).Delete(&models.QuotationItem{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to delete quotation items",
		})
	}

	if err := tx.Where("quotation_id = ?", id).Delete(&models.QuotationMaterial{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to delete quotation materials",
		})
	}

	// Delete quotation
	if err := tx.Delete(&quotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to delete quotation",
		})
	}

	tx.Commit()

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotation deleted successfully",
	})
}

// UpdateQuotationStatus updates the status of a quotation
func UpdateQuotationStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	quotationID := c.Params("id")

	// Parse request
	var req struct {
		Status string `json:"status" validate:"required,oneof=draft issued accepted rejected"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	// Validate quotation ID
	id, err := strconv.ParseUint(quotationID, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	// Check if quotation exists and belongs to user
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&quotation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(APIResponse{
				Success: false,
				Message: "Quotation not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Database error",
		})
	}

	// Validate status transition
	validTransitions := map[string][]string{
		"draft":    {"issued"},
		"issued":   {"accepted", "rejected"},
		"accepted": {},
		"rejected": {},
	}

	allowedStatuses, exists := validTransitions[quotation.Status]
	if !exists {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid current status",
		})
	}

	validTransition := false
	for _, allowedStatus := range allowedStatuses {
		if req.Status == allowedStatus {
			validTransition = true
			break
		}
	}

	if !validTransition {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: fmt.Sprintf("Cannot transition from %s to %s", quotation.Status, req.Status),
		})
	}

	// Update status
	if err := database.DB.Model(&quotation).Update("status", req.Status).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to update quotation status",
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotation status updated successfully",
		Data: fiber.Map{
			"id":     quotation.ID,
			"status": req.Status,
		},
	})
}

// DuplicateQuotation creates a copy of an existing quotation
func DuplicateQuotation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	quotationID := c.Params("id")

	// Validate quotation ID
	id, err := strconv.ParseUint(quotationID, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	// Get original quotation with all relationships
	var originalQuotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("Items.Component").Preload("Materials.Material").
		First(&originalQuotation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(APIResponse{
				Success: false,
				Message: "Quotation not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Database error",
		})
	}

	// Start transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Generate new quotation number
	newQuotationNo, err := utils.GenerateQuotationNo()
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to generate quotation number",
		})
	}

	// Create new quotation
	newQuotation := models.Quotation{
		UserID:      userID,
		Title:       originalQuotation.Title + " (Copy)",
		Description: originalQuotation.Description,
		ClientName:  originalQuotation.ClientName,
		TotalCost:   decimal.NewFromFloat(0), // Will be calculated
		Status:      "draft",
		QuotationNo: newQuotationNo,
	}

	if err := tx.Create(&newQuotation).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to create quotation",
		})
	}

	// Duplicate items
	for _, item := range originalQuotation.Items {
		newItem := models.QuotationItem{
			QuotationID: newQuotation.ID,
			ComponentID: item.ComponentID,
			Length:      item.Length,
			Width:       item.Width,
			Height:      item.Height,
			Quantity:    item.Quantity,
			UnitCost:    item.UnitCost,
			TotalCost:   item.TotalCost,
		}
		if err := tx.Create(&newItem).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Message: "Failed to create quotation items",
			})
		}
	}

	// Duplicate materials
	var materials []models.QuotationMaterial
	if err := database.DB.Where("quotation_id = ?", originalQuotation.ID).Find(&materials).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false, 
			Message: "Failed to fetch quotation materials",
		})
	}

	for _, material := range materials {
		newMaterial := models.QuotationMaterial{
			QuotationID:  newQuotation.ID,
			MaterialID:   material.MaterialID,
			MaterialName: material.MaterialName,
			Unit:         material.Unit,
			UnitCost:     material.UnitCost,
			Quantity:     material.Quantity,
			TotalCost:    material.TotalCost,
		}
		if err := tx.Create(&newMaterial).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
				Success: false,
				Message: "Failed to create quotation materials",
			})
		}
	}

	// Update total cost
	if err := tx.Model(&newQuotation).Update("total_cost", originalQuotation.TotalCost).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to update total cost",
		})
	}

	tx.Commit()

	// Get complete quotation with relationships
	var completeQuotation models.Quotation
	if err := database.DB.Where("id = ?", newQuotation.ID).
		Preload("User").Preload("Items.Component").Preload("Materials.Material").
		First(&completeQuotation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve duplicated quotation",
		})
	}

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotation duplicated successfully",
		Data:    completeQuotation,
	})
}

// GenerateQuotationPDF generates PDF for a quotation
func GenerateQuotationPDF(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	quotationID := c.Params("id")

	// Validate quotation ID
	id, err := strconv.ParseUint(quotationID, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Invalid quotation ID",
		})
	}

	// Get quotation with all relationships
	var quotation models.Quotation
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("User").Preload("Items.Component").Preload("Materials.Material").
		First(&quotation).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(APIResponse{
				Success: false,
				Message: "Quotation not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Database error",
		})
	}

	// Generate PDF using utils function
	pdfBytes, err := utils.GenerateQuotationPDF(&quotation)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to generate PDF",
		})
	}

	// Set headers for PDF download
	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=quotation_%s.pdf", quotation.QuotationNo))
	c.Set("Content-Length", strconv.Itoa(len(pdfBytes)))

	return c.Send(pdfBytes)
}

// ListAllQuotations retrieves all quotations for admin with pagination
func ListAllQuotations(c *fiber.Ctx) error {
	// Parse pagination parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	// Parse filters
	status := c.Query("status")
	userID := c.Query("user_id")

	var quotations []models.Quotation
	var total int64

	// Build query
	query := database.DB.Model(&models.Quotation{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to count quotations",
		})
	}

	// Get quotations with relationships
	if err := query.Preload("User").Preload("Items.Component").Preload("Materials.Material").
		Order("created_at DESC").Offset(offset).Limit(limit).Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve quotations",
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return c.JSON(APIResponse{
		Success: true,
		Message: "Quotations retrieved successfully",
		Data: fiber.Map{
			"quotations":  quotations,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
		},
	})
}

// SearchQuotations searches quotations by title, description, or quotation number
func SearchQuotations(c *fiber.Ctx) error {
	// Parse search parameters
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIResponse{
			Success: false,
			Message: "Search query is required",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	// Parse filters
	status := c.Query("status")
	userID := c.Query("user_id")

	var quotations []models.Quotation
	var total int64

	// Build search query
	searchQuery := database.DB.Where(
		"title ILIKE ? OR description ILIKE ? OR quotation_no ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%",
	)

	if status != "" {
		searchQuery = searchQuery.Where("status = ?", status)
	}
	if userID != "" {
		searchQuery = searchQuery.Where("user_id = ?", userID)
	}

	// Get total count
	if err := searchQuery.Model(&models.Quotation{}).Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to count search results",
		})
	}

	// Get quotations with relationships
	if err := searchQuery.Preload("User").Preload("Items.Component").Preload("Materials.Material").
		Order("created_at DESC").Offset(offset).Limit(limit).Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to search quotations",
		})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))

	return c.JSON(APIResponse{
		Success: true,
		Message: "Search completed successfully",
		Data: fiber.Map{
			"quotations":  quotations,
			"total":       total,
			"page":        page,
			"limit":       limit,
			"total_pages": totalPages,
			"query":       query,
		},
	})
}

// GenerateSalesReport generates sales report for admin
func GenerateSalesReport(c *fiber.Ctx) error {
	// Parse date range parameters
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var quotations []models.Quotation
	query := database.DB.Where("status = ?", "accepted")

	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}

	// Get accepted quotations with relationships
	if err := query.Preload("User").Preload("Items.Component").Preload("Materials.Material").
		Find(&quotations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve quotations for report",
		})
	}

	// Generate report using utils function
	report := utils.GenerateSalesReport(quotations)

	return c.JSON(APIResponse{
		Success: true,
		Message: "Sales report generated successfully",
		Data:    report,
	})
}

// GenerateMaterialUsageReport generates material usage report for admin
func GenerateMaterialUsageReport(c *fiber.Ctx) error {
	// Parse date range parameters
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var materials []models.Material
	query := database.DB

	if startDate != "" || endDate != "" {
		// If date range is specified, join with quotations to filter by date
		subQuery := database.DB.Model(&models.Quotation{}).Select("id")
		if startDate != "" {
			subQuery = subQuery.Where("created_at >= ?", startDate)
		}
		if endDate != "" {
			subQuery = subQuery.Where("created_at <= ?", endDate)
		}

		query = query.Joins("JOIN quotation_materials qm ON materials.id = qm.material_id").
			Where("qm.quotation_id IN (?)", subQuery).Distinct()
	}

	// Get materials
	if err := query.Find(&materials).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIResponse{
			Success: false,
			Message: "Failed to retrieve materials for report",
		})
	}

	// Generate report using utils function
	report := utils.GenerateMaterialUsageReport(materials)

	return c.JSON(APIResponse{
		Success: true,
		Message: "Material usage report generated successfully",
		Data:    report,
	})
}
