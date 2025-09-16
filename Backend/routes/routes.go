package routes

import (
	"qp1/controllers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// -------------------- Public & Auth Routes --------------------
	app.Get("/", controllers.Hello)
	app.Post("/api/register", controllers.Register)
	app.Post("/api/login", controllers.Login)
	app.Get("/api/user", controllers.User)
	app.Post("/api/logout", controllers.Logout)
	app.Post("/api/reset-password", controllers.ResetPassword)
	app.Post("/api/change-password", controllers.RequireUser, controllers.ChangePassword)

	// -------------------- User Management (Admin Only) --------------------
	app.Get("/api/admin/users", controllers.RequireAdmin, controllers.AdminUserList)
	app.Post("/api/admin/user", controllers.RequireAdmin, controllers.AddUser)
	app.Put("/api/admin/user/:id", controllers.RequireAdmin, controllers.UpdateUser)
	app.Delete("/api/admin/user/:id", controllers.RequireAdmin, controllers.DeleteUser)
	app.Get("/api/admin/user/:id", controllers.RequireAdmin, controllers.GetUserById)
	app.Put("/api/admin/user/:id/role", controllers.RequireAdmin, controllers.UpdateUserRole)
	app.Post("/api/admin/reset-password", controllers.RequireAdmin, controllers.AdminResetPassword)
	app.Post("/api/admin/delete-user", controllers.RequireAdmin, controllers.AdminDeleteUser)

	// -------------------- Client Management (Admin Only) --------------------
	// Remove these client management routes:
	// app.Post("/api/admin/client", controllers.RequireAdmin, controllers.AddClient)
	// app.Put("/api/admin/client/:id", controllers.RequireAdmin, controllers.UpdateClient)
	// app.Delete("/api/admin/client/:id", controllers.RequireAdmin, controllers.DeleteClient)
	// app.Get("/api/admin/client/:id", controllers.RequireAdmin, controllers.GetClientById)
	// app.Get("/api/admin/clients", controllers.RequireAdmin, controllers.ListClients)
	// app.Get("/api/admin/search-clients", controllers.RequireAdmin, controllers.SearchClients)

	// -------------------- Material Management (Admin Only) --------------------
	app.Post("/api/admin/create-material", controllers.RequireAdmin, controllers.CreateMaterial)
	app.Get("/api/admin/get-materials", controllers.RequireAdmin, controllers.ListMaterials)
	app.Put("/api/admin/update-material/:id", controllers.RequireAdmin, controllers.UpdateMaterial)
	app.Delete("/api/admin/delete-material/:id", controllers.RequireAdmin, controllers.DeleteMaterial)
	app.Get("/api/admin/get-material/:id", controllers.RequireAdmin, controllers.GetMaterialById)
	app.Get("/api/admin/search-materials", controllers.RequireAdmin, controllers.SearchMaterials)

	// -------------------- Component Management (Admin Only) --------------------
	app.Post("/api/admin/component", controllers.RequireAdmin, controllers.CreateComponent)
	app.Get("/api/admin/components", controllers.RequireAdmin, controllers.ListComponents)
	app.Get("/api/admin/component/:id", controllers.RequireAdmin, controllers.GetComponent)
	app.Put("/api/admin/component/:id", controllers.RequireAdmin, controllers.UpdateComponent)
	app.Delete("/api/admin/component/:id", controllers.RequireAdmin, controllers.DeleteComponent)
	app.Get("/api/admin/search-components", controllers.RequireAdmin, controllers.SearchComponents)

	// -------------------- Quotation Management (User) --------------------
	app.Post("/api/quotations", controllers.RequireUser, controllers.CreateQuotation)
	app.Post("/api/quotations/draft", controllers.RequireUser, controllers.SaveQuotationDraft)
	app.Get("/api/quotations", controllers.RequireUser, controllers.ListQuotations)
	app.Get("/api/quotations/:id", controllers.RequireUser, controllers.GetQuotation)
	app.Put("/api/quotations/:id", controllers.RequireUser, controllers.UpdateQuotation)
	app.Put("/api/quotations/:id/draft", controllers.RequireUser, controllers.SaveQuotationDraft)
	app.Delete("/api/quotations/:id", controllers.RequireUser, controllers.DeleteQuotation)
	app.Put("/api/quotations/:id/status", controllers.RequireUser, controllers.UpdateQuotationStatus)
	app.Post("/api/quotations/:id/duplicate", controllers.RequireUser, controllers.DuplicateQuotation)
	app.Get("/api/quotations/:id/pdf", controllers.RequireUser, controllers.GenerateQuotationPDF)

	// -------------------- Quotation Management (Admin) --------------------
	app.Get("/api/admin/quotations", controllers.RequireAdmin, controllers.ListAllQuotations)
	app.Get("/api/admin/search-quotations", controllers.RequireAdmin, controllers.SearchQuotations)
	app.Get("/api/admin/sales-report", controllers.RequireAdmin, controllers.GenerateSalesReport)
	app.Get("/api/admin/material-usage-report", controllers.RequireAdmin, controllers.GenerateMaterialUsageReport)

	// -------------------- Product/Material List (User) --------------------
	app.Get("/api/products", controllers.RequireUser, controllers.GetProductList)
	app.Get("/api/products/:id", controllers.RequireUser, controllers.GetProductDetail)

	// -------------------- Settings Management (Admin Only) --------------------
	app.Put("/api/admin/settings/company", controllers.RequireAdmin, controllers.UpdateCompanyInfo)
	app.Put("/api/admin/settings/tax", controllers.RequireAdmin, controllers.UpdateTaxSettings)
	app.Put("/api/admin/settings/currency", controllers.RequireAdmin, controllers.UpdateCurrencySettings)
	app.Put("/api/admin/settings/quotation-no-format", controllers.RequireAdmin, controllers.UpdateQuotationNumberFormat)
	app.Put("/api/admin/settings/terms", controllers.RequireAdmin, controllers.UpdateTermsAndConditions)

	// -------------------- User Self-Service (Profile & Password) --------------------
	app.Put("/api/user/profile", controllers.RequireUser, controllers.UpdateUserProfile)
	app.Put("/api/user/password", controllers.RequireUser, controllers.UpdateUserPassword)
}
