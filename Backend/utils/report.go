package utils

import "qp1/models"

type SalesReport struct {
	TotalQuotations int     `json:"total_quotations"`
	TotalAmount     float64 `json:"total_amount"`
}

func GenerateSalesReport(quotations []models.Quotation) SalesReport {
	var total float64
	for _, q := range quotations {
		total += q.TotalCost // Replace 'Amount' with the actual field name in models.Quotation
	}
	return SalesReport{
		TotalQuotations: len(quotations),
		TotalAmount:     total,
	}
}

type MaterialUsage struct {
	MaterialID   uint    `json:"material_id"`
	MaterialName string  `json:"material_name"`
	TotalUsed    float64 `json:"total_used"`
}

func GenerateMaterialUsageReport(materials []models.Material) []MaterialUsage {
	var report []MaterialUsage
	for _, m := range materials {
		report = append(report, MaterialUsage{
			MaterialID:   m.ID,
			MaterialName: m.Name,
			TotalUsed:    m.StockQty, // Adjust field as needed
		})
	}
	return report
}
