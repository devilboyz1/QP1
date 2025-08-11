package utils

// ApplyDiscount applies a discount (percentage, e.g. 0.1 for 10%) to a subtotal
func ApplyDiscount(subtotal float64, discountRate float64) float64 {
	return subtotal * (1 - discountRate)
}
