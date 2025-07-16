/**
 * Adds plural suffix 's' to a word if count is greater than 1
 *
 * @param count - The number to check for pluralization
 * @returns 's' if count > 1, empty string otherwise
 *
 * @example
 * ```typescript
 * plural(1) // returns ''
 * plural(2) // returns 's'
 * plural(0) // returns ''
 * ```
 */
export const plural = (count: number) => (count > 1 ? 's' : '')
