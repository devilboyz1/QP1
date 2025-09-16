package utils

import (
	"html"
	"regexp"
	"strings"
)

// SanitizeClientName cleans and validates client name input
func SanitizeClientName(input string) string {
	// Handle empty input
	if input == "" {
		return ""
	}

	// Remove HTML tags and escape special characters
	cleaned := html.EscapeString(input)

	// Remove potentially dangerous characters, keep only:
	// - Letters (a-z, A-Z)
	// - Numbers (0-9)
	// - Spaces
	// - Hyphens (-)
	// - Periods (.)
	// - Commas (,)
	// - Apostrophes (')
	re := regexp.MustCompile(`[^a-zA-Z0-9\s\-\.,']`)
	cleaned = re.ReplaceAllString(cleaned, "")

	// Trim whitespace and normalize multiple spaces
	cleaned = strings.TrimSpace(cleaned)
	re = regexp.MustCompile(`\s+`)
	cleaned = re.ReplaceAllString(cleaned, " ")

	// Limit length to 255 characters
	if len(cleaned) > 255 {
		cleaned = cleaned[:255]
		cleaned = strings.TrimSpace(cleaned)
	}

	return cleaned
}
