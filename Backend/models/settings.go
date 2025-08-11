package models

import (
	"time"

	"gorm.io/gorm"
)

type Settings struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	CompanyName        string         `json:"company_name"`
	CompanyAddress     string         `json:"company_address"`
	CompanyLogo        string         `json:"company_logo"` // URL or base64
	TaxRate            float64        `json:"tax_rate"`
	Currency           string         `json:"currency"`
	QuotationNoFormat  string         `json:"quotation_no_format"`
	TermsAndConditions string         `json:"terms_and_conditions"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}
