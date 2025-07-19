package models

import (
	"time"

	"gorm.io/gorm"
)

type Material struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string         `gorm:"unique;not null" json:"name"`
	Description    string         `gorm:"type:text" json:"description"`
	Unit           string         `json:"unit"`
	UnitCost       float64        `gorm:"type:decimal(10,2);not null;default:0" json:"unit_cost"`
	StockQty       float64        `gorm:"not null;default:0" json:"stock_qty"`
	Classification string         `json:"classification"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
