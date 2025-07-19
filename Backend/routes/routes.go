package routes

import (
	"qp1/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) { // Test route to verify application setup
	app.Get("/", controllers.Hello)
	app.Post("/api/register", controllers.Register)
	app.Post("/api/login", controllers.Login)
	app.Get("/api/user", controllers.User)
	app.Post("/api/logout", controllers.Logout)
	app.Post("/api/reset-password", controllers.ResetPassword)
	app.Get("/api/admin/users", controllers.RequireAdmin, controllers.AdminUserList)
	app.Post("/api/admin/reset-password", controllers.RequireAdmin, controllers.AdminResetPassword)
	app.Post("/api/admin/delete-user", controllers.RequireAdmin, controllers.AdminDeleteUser)
	// Material管理接口（仅管理员）
	app.Post("/api/admin/material", controllers.RequireAdmin, controllers.CreateMaterial)
	app.Get("/api/admin/materials", controllers.RequireAdmin, controllers.ListMaterials)
	app.Put("/api/admin/material/:id", controllers.RequireAdmin, controllers.UpdateMaterial)
	app.Delete("/api/admin/material/:id", controllers.RequireAdmin, controllers.DeleteMaterial)
	// 普通用户获取物料列表
	app.Get("/api/products", controllers.GetProductList)
	app.Get("/api/products/:id", controllers.GetProductDetail)
}
