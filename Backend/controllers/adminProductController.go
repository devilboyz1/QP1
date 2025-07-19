package controllers

import (
	"qp1/database"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
)

// CreateMaterial 新增物料
func CreateMaterial(c *fiber.Ctx) error {
	var data models.Material
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}
	if data.Name == "" || data.Unit == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Name and unit are required"})
	}
	if data.UnitCost < 0 || data.StockQty < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Unit cost and stock quantity must be non-negative"})
	}
	if err := database.DB.Create(&data).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create material"})
	}
	return c.JSON(data)
}

// ListMaterials 查询所有物料
func ListMaterials(c *fiber.Ctx) error {
	var materials []models.Material
	if err := database.DB.Find(&materials).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch materials"})
	}
	return c.JSON(materials)
}

// UpdateMaterial 修改物料
func UpdateMaterial(c *fiber.Ctx) error {
	id := c.Params("id")
	var material models.Material
	if err := database.DB.First(&material, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Material not found"})
	}
	var data models.Material
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}
	if data.Name != "" {
		material.Name = data.Name
	}
	if data.Description != "" {
		material.Description = data.Description
	}
	if data.Unit != "" {
		material.Unit = data.Unit
	}
	if data.UnitCost >= 0 {
		material.UnitCost = data.UnitCost
	}
	if data.StockQty >= 0 {
		material.StockQty = data.StockQty
	}
	if err := database.DB.Save(&material).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update material"})
	}
	return c.JSON(material)
}

// DeleteMaterial 删除物料
func DeleteMaterial(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Material{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete material"})
	}
	return c.JSON(fiber.Map{"message": "Material deleted successfully"})
}
