package controllers

import (
	"qp1/database"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
)

// GetProductList 普通用户获取所有物料列表，支持分类筛选、分页、关键字搜索
func GetProductList(c *fiber.Ctx) error {
	var materials []models.Material
	query := database.DB

	// 分类筛选
	classification := c.Query("classification")
	if classification != "" {
		query = query.Where("classification = ?", classification)
	}

	// 关键字搜索（name/description模糊匹配）
	keyword := c.Query("keyword")
	if keyword != "" {
		like := "%" + keyword + "%"
		query = query.Where("name LIKE ? OR description LIKE ?", like, like)
	}

	// 分页
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&models.Material{}).Count(&total)
	if err := query.Offset(offset).Limit(pageSize).Find(&materials).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch product list"})
	}
	return c.JSON(fiber.Map{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"data":      materials,
	})
}

// GetProductDetail 获取单个物料详情
func GetProductDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	var material models.Material
	if err := database.DB.First(&material, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}
	return c.JSON(material)
}
