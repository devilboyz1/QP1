package models

import (
	"time"

	"gorm.io/gorm"
)

// Component represents a component made up of multiple materials
type Component struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string         `gorm:"unique;not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	TotalCost   float64        `gorm:"type:decimal(10,2);not null;default:0" json:"total_cost"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Many-to-many relationship with materials
	Materials []ComponentMaterial `json:"materials"`
}

// ComponentMaterial represents the junction table between components and materials
type ComponentMaterial struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	ComponentID uint    `gorm:"not null" json:"component_id"`
	MaterialID  uint    `gorm:"not null" json:"material_id"`
	Quantity    float64 `gorm:"not null;default:1" json:"quantity"`

	// Relationships
	Component Component `gorm:"foreignKey:ComponentID" json:"component"`
	Material  Material  `gorm:"foreignKey:MaterialID" json:"material"`
}
