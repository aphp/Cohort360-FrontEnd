/**
 * @fileoverview Utility functions for number formatting
 * @module utils/numbers
 */

import { plural } from './string'

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

/**
 * Formats a count number with abbreviated units (K, M, B, T) for large numbers
 *
 * @param criteriaCount - The number to format
 * @param bigIntAllowed - If true, allows numbers up to 100,000 before abbreviation, otherwise 1,000
 * @returns The formatted count string with appropriate unit abbreviation
 *
 * @example
 * ```typescript
 * displayCount(999) // returns '999'
 * displayCount(1500) // returns '~2k'
 * displayCount(1500000) // returns '~2M'
 * displayCount(999, true) // returns '999'
 * displayCount(50000, true) // returns '50000'
 * displayCount(150000, true) // returns '~150k'
 * ```
 */
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

/**
 * Formats a patient count for version display with proper pluralization
 *
 * @param criteriaCount - The number of patients to format (optional)
 * @returns A formatted string displaying the patient count with plural suffix, or '-' if count is null/undefined
 *
 * @example
 * ```typescript
 * displayVersionsCount(1) // returns '1 patient'
 * displayVersionsCount(1500) // returns '~2k patients'
 * displayVersionsCount(null) // returns '-'
 * displayVersionsCount(undefined) // returns '-'
 * ```
 */
export const displayVersionsCount = (criteriaCount?: number | null) => {
  return criteriaCount !== undefined && criteriaCount !== null
    ? `${displayCount(criteriaCount, true)} patient${plural(criteriaCount)}`
    : '-'
}
