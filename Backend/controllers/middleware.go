package controllers

import (
	"qp1/database"
	"qp1/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// RequireAdmin 是一个Fiber中间件，校验JWT中的role字段为admin
func RequireAdmin(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "未登录"})
	}
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "无效token"})
	}
	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "解析claims失败"})
	}
	role, ok := (*claims)["role"].(string)
	if !ok || role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "无权限，仅限管理员"})
	}
	return c.Next()
}

// RequireUser 是一个Fiber中间件，校验JWT并设置用户信息到上下文
func RequireUser(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "未登录"})
	}
	token, err := jwt.ParseWithClaims(cookie, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "无效token"})
	}
	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "解析claims失败"})
	}
	id, ok := (*claims)["sub"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "无效用户ID"})
	}
	// Remove the unused role variable declaration
	// role, _ := (*claims)["role"].(string)
	// Remove unused role variable

	// Convert string ID to uint and fetch user from database
	userID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "无效用户ID格式"})
	}

	// Fetch user from database
	var user models.User
	if err := database.DB.First(&user, uint(userID)).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "用户不存在"})
	}

	// Store the actual User model
	c.Locals("user", user)
	return c.Next()
}
