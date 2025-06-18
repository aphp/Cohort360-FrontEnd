/**
 * @fileoverview String capitalization utility functions
 * @module utils/capitalize
 */

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
