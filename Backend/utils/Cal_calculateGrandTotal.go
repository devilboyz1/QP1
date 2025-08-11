package utils

// CalculateGrandTotal calculates the final total after discount and tax
func CalculateGrandTotal(subtotal, discountRate, taxRate float64) float64 {
	afterDiscount := ApplyDiscount(subtotal, discountRate)
	return ApplyTax(afterDiscount, taxRate)
}
