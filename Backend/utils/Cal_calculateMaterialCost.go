package utils

import "qp1/models"

// CalculateMaterialCost sums the total cost of a list of materials
func CalculateMaterialCost(materials []models.Material, quantities map[uint]float64) float64 {
	var total float64
	for _, m := range materials {
		qty := quantities[m.ID]
		total += m.UnitCost * qty
	}
	return total
}
