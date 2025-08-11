package utils

// ApplyTax applies tax (percentage, e.g. 0.07 for 7%) to a subtotal
func ApplyTax(subtotal float64, taxRate float64) float64 {
	return subtotal * (1 + taxRate)
}
