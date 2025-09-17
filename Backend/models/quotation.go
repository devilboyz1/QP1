package models

import (
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// Quotation represents a quotation with components and calculated costs
type Quotation struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	UserID      uint            `gorm:"not null;index" json:"user_id"`
	CreatedBy   string          `gorm:"type:varchar(255)" json:"created_by"`
	ClientName  string          `gorm:"type:varchar(255)" json:"client_name,omitempty"`
	Title       string          `gorm:"type:varchar(255);not null" json:"title"`
	Description string          `gorm:"type:text" json:"description,omitempty"`
	Status      string          `gorm:"type:varchar(50);default:'draft'" json:"status"`
	TotalCost   decimal.Decimal `gorm:"type:decimal(15,2);default:0" json:"total_cost"`
	QuotationNo string          `gorm:"type:varchar(100);uniqueIndex" json:"quotation_no"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"-"`

	// Remove Client relationship
	User      User               `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Items     []QuotationItem    `gorm:"foreignKey:QuotationID" json:"items,omitempty"`
	Materials []QuotationMaterial `gorm:"foreignKey:QuotationID" json:"materials,omitempty"` 
}

// QuotationItem represents a component in a quotation with dimensions and quantities
type QuotationItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	QuotationID uint    `gorm:"not null" json:"quotation_id"`
	ComponentID uint    `gorm:"not null" json:"component_id"`
	Length      float64 `gorm:"not null;default:1" json:"length"`
	Width       float64 `gorm:"not null;default:1" json:"width"`
	Height      float64 `gorm:"not null;default:1" json:"height"`
	Quantity    int     `gorm:"not null;default:1" json:"quantity"`
	UnitCost    float64 `gorm:"type:decimal(10,2);not null;default:0" json:"unit_cost"`
	TotalCost   float64 `gorm:"type:decimal(10,2);not null;default:0" json:"total_cost"`

	// Relationships
	Quotation Quotation `gorm:"foreignKey:QuotationID" json:"quotation"`
	Component Component `gorm:"foreignKey:ComponentID" json:"component"`
}

// QuotationMaterial represents the resolved materials from components with calculated quantities
type QuotationMaterial struct {
	ID           uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	QuotationID  uint    `gorm:"not null" json:"quotation_id"`
	MaterialID   uint    `gorm:"not null" json:"material_id"`
	MaterialName string  `gorm:"not null" json:"material_name"`
	Unit         string  `gorm:"not null" json:"unit"`
	UnitCost     float64 `gorm:"type:decimal(10,2);not null;default:0" json:"unit_cost"`
	Quantity     float64 `gorm:"not null;default:0" json:"quantity"`
	TotalCost    float64 `gorm:"type:decimal(10,2);not null;default:0" json:"total_cost"`

	// Relationships
	Quotation Quotation `gorm:"foreignKey:QuotationID" json:"quotation"`
	Material  Material  `gorm:"foreignKey:MaterialID" json:"material"`
}
