/**
 * Capitalizes the first letter of each word in a string
 *
 * @param string - The string to capitalize
 * @returns The capitalized string, or empty string if input is falsy
 *
 * @example
 * ```typescript
 * capitalizeFirstLetter('hello world') // returns 'Hello World'
 * capitalizeFirstLetter('') // returns ''
 * capitalizeFirstLetter(undefined) // returns ''
 * ```
 */
export const capitalizeFirstLetter = (string?: string): string => {
  if (!string) return ''

  return string
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

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
