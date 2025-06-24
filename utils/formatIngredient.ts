/**
 * Formats an ingredient into a standardized string representation
 * Handles both string and object formats
 */
export function formatIngredient(ingredient: any): string {
  // If ingredient is null or undefined, return empty string
  if (!ingredient) return ""

  // If ingredient is a string, return it directly
  if (typeof ingredient === "string") return ingredient

  // If ingredient is an object with a name property
  if (typeof ingredient === "object" && ingredient.name) {
    return ingredient.name
  }

  // Fallback for any other case
  return String(ingredient)
}
