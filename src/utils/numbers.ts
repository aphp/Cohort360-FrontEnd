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

export const displayCount = (criteriaCount: number, bigIntAllowed = false) => {
  if (criteriaCount < (!bigIntAllowed ? 1000 : 100000)) {
    return criteriaCount.toString() // Normal values (less than 1,000)
  } else if (criteriaCount < 1000000) {
    return `~${Math.round(criteriaCount / 1000)}k` // Thousands
  } else if (criteriaCount < 1000000000) {
    return `~${Math.round(criteriaCount / 1000000)}M` // Millions
  } else if (criteriaCount < 1000000000000) {
    return `~${Math.round(criteriaCount / 1000000000)}B` // Billions
  }
  return `~${Math.round(criteriaCount / 1000000000000)}T` // Trillions
}

export const displayVersionsCount = (criteriaCount?: number | null) => {
  return criteriaCount !== undefined && criteriaCount !== null
    ? `${displayCount(criteriaCount, true)} patient${criteriaCount > 1 ? 's' : ''}`
    : '-'
}
