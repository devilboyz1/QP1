package utils

import (
	"fmt"
	"qp1/database"
	"qp1/models"
	"time"
)

// GenerateQuotationNo generates a unique quotation number in the format QT-YYYYMMDD-XXXX
func GenerateQuotationNo() (string, error) {
	today := time.Now().Format("20060102")
	startOfDay := time.Now().Truncate(24 * time.Hour)
	endOfDay := startOfDay.Add(24 * time.Hour)

	var count int64
	if err := database.DB.Model(&models.Quotation{}).
		Where("created_at >= ? AND created_at < ?", startOfDay, endOfDay).
		Count(&count).Error; err != nil {
		return "", err
	}
	seq := count + 1
	return fmt.Sprintf("QT-%s-%04d", today, seq), nil
}
