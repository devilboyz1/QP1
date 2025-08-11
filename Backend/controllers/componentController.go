package controllers

import (
	"qp1/database"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
)

// CreateComponentRequest represents the request structure for creating a component
type CreateComponentRequest struct {
	Name        string                   `json:"name"`
	Description string                   `json:"description"`
	Materials   []ComponentMaterialInput `json:"materials"`
}

// ComponentMaterialInput represents material input for component creation
type ComponentMaterialInput struct {
	MaterialID uint    `json:"material_id"`
	Quantity   float64 `json:"quantity"`
}

// CreateComponent creates a new component with its materials
func CreateComponent(c *fiber.Ctx) error {
	var req CreateComponentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Component name is required"})
	}

	if len(req.Materials) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "At least one material is required"})
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Create the component
	component := models.Component{
		Name:        req.Name,
		Description: req.Description,
		TotalCost:   0, // Will be calculated below
	}

	if err := tx.Create(&component).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create component"})
	}

	// Add materials to the component and calculate total cost
	totalCost := 0.0
	for _, materialInput := range req.Materials {
		// Verify material exists
		var material models.Material
		if err := tx.First(&material, materialInput.MaterialID).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Material not found"})
		}

		// Create component-material relationship
		componentMaterial := models.ComponentMaterial{
			ComponentID: component.ID,
			MaterialID:  materialInput.MaterialID,
			Quantity:    materialInput.Quantity,
		}

		if err := tx.Create(&componentMaterial).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add material to component"})
		}

		// Calculate total cost
		totalCost += material.UnitCost * materialInput.Quantity
	}

	// Update component with total cost
	component.TotalCost = totalCost
	if err := tx.Save(&component).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update component cost"})
	}

	// Commit transaction
	tx.Commit()

	// Fetch the complete component with materials
	var completeComponent models.Component
	database.DB.Preload("Materials.Material").First(&completeComponent, component.ID)

	return c.JSON(completeComponent)
}

// ListComponents retrieves all components with their materials
func ListComponents(c *fiber.Ctx) error {
	var components []models.Component
	if err := database.DB.Preload("Materials.Material").Find(&components).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch components"})
	}
	return c.JSON(components)
}

// GetComponent retrieves a specific component with its materials
func GetComponent(c *fiber.Ctx) error {
	id := c.Params("id")
	var component models.Component
	if err := database.DB.Preload("Materials.Material").First(&component, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Component not found"})
	}
	return c.JSON(component)
}

// UpdateComponentRequest represents the request structure for updating a component
type UpdateComponentRequest struct {
	Name        string                   `json:"name"`
	Description string                   `json:"description"`
	Materials   []ComponentMaterialInput `json:"materials"`
}

// UpdateComponent updates an existing component and its materials
func UpdateComponent(c *fiber.Ctx) error {
	id := c.Params("id")
	var component models.Component
	if err := database.DB.First(&component, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Component not found"})
	}

	var req UpdateComponentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Update basic component info
	if req.Name != "" {
		component.Name = req.Name
	}
	if req.Description != "" {
		component.Description = req.Description
	}

	// If materials are provided, update them
	if len(req.Materials) > 0 {
		// Delete existing component-material relationships
		if err := tx.Where("component_id = ?", component.ID).Delete(&models.ComponentMaterial{}).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update component materials"})
		}

		// Add new materials and calculate total cost
		totalCost := 0.0
		for _, materialInput := range req.Materials {
			// Verify material exists
			var material models.Material
			if err := tx.First(&material, materialInput.MaterialID).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Material not found"})
			}

			// Create new component-material relationship
			componentMaterial := models.ComponentMaterial{
				ComponentID: component.ID,
				MaterialID:  materialInput.MaterialID,
				Quantity:    materialInput.Quantity,
			}

			if err := tx.Create(&componentMaterial).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add material to component"})
			}

			// Calculate total cost
			totalCost += material.UnitCost * materialInput.Quantity
		}

		component.TotalCost = totalCost
	}

	// Save the updated component
	if err := tx.Save(&component).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update component"})
	}

	// Commit transaction
	tx.Commit()

	// Fetch the complete updated component
	var updatedComponent models.Component
	database.DB.Preload("Materials.Material").First(&updatedComponent, component.ID)

	return c.JSON(updatedComponent)
}

// DeleteComponent deletes a component and its material relationships
func DeleteComponent(c *fiber.Ctx) error {
	id := c.Params("id")

	// Start a transaction
	tx := database.DB.Begin()

	// Delete component-material relationships first
	if err := tx.Where("component_id = ?", id).Delete(&models.ComponentMaterial{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete component materials"})
	}

	// Delete the component
	if err := tx.Delete(&models.Component{}, id).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete component"})
	}

	// Commit transaction
	tx.Commit()

	return c.JSON(fiber.Map{"message": "Component deleted successfully"})
}

// SearchComponents allows searching components by name or description
func SearchComponents(c *fiber.Ctx) error {
	name := c.Query("name")
	description := c.Query("description")

	var components []models.Component
	query := database.DB.Preload("Materials.Material")

	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	if description != "" {
		query = query.Where("description LIKE ?", "%"+description+"%")
	}

	if err := query.Find(&components).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to search components"})
	}
	return c.JSON(components)
}
