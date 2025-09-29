/**
 * @fileoverview Utility functions for number formatting
 * @module utils/numbers
 */

/**
 * Formats a number with space as thousand separator, or returns '-' for null/undefined values
 *
 * @param nb - The number to format
 * @returns The formatted number string with space separators, or '-' if input is null/undefined
 *
 * @example
 * ```typescript
 * format(1234567) // returns '1 234 567'
 * format(1000) // returns '1 000'
 * format(null) // returns '-'
 * format(undefined) // returns '-'
 * ```
 */
export const format = (nb: number | null | undefined) => {
  if (nb === null || nb === undefined) return '-'
  return nb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const formatPercentage = (nb: number | null | undefined, decimalPlaces = 2) => {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces
  })
  if (nb === null || nb === undefined) return 'N/A'
  return `${formatter.format(nb)}`
}
