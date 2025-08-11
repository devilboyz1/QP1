package controllers

import (
	"qp1/database"
	"qp1/models"

	"github.com/gofiber/fiber/v2"
)

// AddClient adds a new client
func AddClient(c *fiber.Ctx) error {
	var client models.Client
	if err := c.BodyParser(&client); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if err := database.DB.Create(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add client"})
	}
	return c.JSON(client)
}

// UpdateClient edits client details
func UpdateClient(c *fiber.Ctx) error {
	id := c.Params("id")
	var client models.Client
	if err := database.DB.First(&client, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Client not found"})
	}
	if err := c.BodyParser(&client); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if err := database.DB.Save(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update client"})
	}
	return c.JSON(client)
}

// DeleteClient removes a client
func DeleteClient(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Client{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete client"})
	}
	return c.JSON(fiber.Map{"message": "Client deleted"})
}

// GetClientById views single client info
func GetClientById(c *fiber.Ctx) error {
	id := c.Params("id")
	var client models.Client
	if err := database.DB.First(&client, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Client not found"})
	}
	return c.JSON(client)
}

// ListClients lists all clients
func ListClients(c *fiber.Ctx) error {
	var clients []models.Client
	if err := database.DB.Find(&clients).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch clients"})
	}
	return c.JSON(clients)
}

// SearchClients searches client records by name or email
func SearchClients(c *fiber.Ctx) error {
	name := c.Query("name")
	email := c.Query("email")
	var clients []models.Client
	query := database.DB
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	if email != "" {
		query = query.Where("email LIKE ?", "%"+email+"%")
	}
	if err := query.Find(&clients).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to search clients"})
	}
	return c.JSON(clients)
}
