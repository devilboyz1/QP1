package utils

import "qp1/models"

// CalculateComponentCost sums the total cost of a list of components
func CalculateComponentCost(components []models.Component, quantities map[uint]int) float64 {
	var total float64
	for _, c := range components {
		qty := quantities[c.ID]
		total += c.TotalCost * float64(qty)
	}
	return total
}
