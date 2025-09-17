package database

import (
	"fmt"
	"qp1/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// creating a reference to a GORM database connection that can be used throughout your application to perform
// database operations like querying, inserting, updating, and deleting data from the database.
var DB *gorm.DB

// Connect to MySQL database
func ConnectDB() (*gorm.DB, error) {
	// Database configuration
	dsn := "root:1234@tcp(localhost:3306)/qp1?charset=utf8mb4&parseTime=True&loc=Local"
	// dsn := "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"

	// Connect to MySQL database
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	DB = db

	err = db.AutoMigrate(
		&models.User{},
		&models.Material{},
		&models.Component{},
		&models.ComponentMaterial{},
		&models.Quotation{},
		&models.QuotationItem{},
		&models.QuotationMaterial{},
	)
	if err != nil {
		fmt.Printf("Migration error: %v\n", err)
		return nil, err
	}
	fmt.Println("Database migration completed successfully")
	return db, nil
}
