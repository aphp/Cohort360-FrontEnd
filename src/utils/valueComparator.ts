/**
 * @fileoverview Utility functions for converting between comparators and filter strings
 * @module utils/valueComparator
 */

import { Comparators } from 'types/requestCriterias'

/**
 * Converts a Comparator enum value to its corresponding filter string
 *
 * @param comparator - The comparator enum value
 * @returns The corresponding filter string (lt, le, gt, ge, or empty string)
 *
 * @example
 * ```typescript
 * comparatorToFilter(Comparators.LESS) // returns 'lt'
 * comparatorToFilter(Comparators.EQUAL) // returns ''
 * ```
 */
export const comparatorToFilter = (comparator: Comparators) => {
  let filter = ''
  if (comparator) {
    switch (comparator) {
      case Comparators.LESS:
        filter = 'lt'
        break
      case Comparators.LESS_OR_EQUAL:
        filter = 'le'
        break
      case Comparators.EQUAL:
        filter = ''
        break
      case Comparators.GREATER:
        filter = 'gt'
        break
      case Comparators.GREATER_OR_EQUAL:
        filter = 'ge'
        break
      default:
        filter = ''
        break
    }
  }
  return filter
}

/**
 * Converts a filter string to its corresponding Comparator enum value
 *
 * @param filter - The filter string to convert
 * @returns The corresponding Comparator enum value
 *
 * @example
 * ```typescript
 * filterToComparator('lt') // returns Comparators.LESS
 * filterToComparator('') // returns Comparators.EQUAL
 * ```
 */
export const filterToComparator = (filter: string) => {
  if (filter.startsWith('lt')) {
    return Comparators.LESS
  } else if (filter.startsWith('le')) {
    return Comparators.LESS_OR_EQUAL
  } else if (filter.startsWith('gt')) {
    return Comparators.GREATER
  } else if (filter.startsWith('ge')) {
    return Comparators.GREATER_OR_EQUAL
  } else {
    return Comparators.EQUAL
  }
}

/**
 * Parses an occurrence string to extract comparator and numeric value
 *
 * @param value - The occurrence string to parse (e.g., 'ge5', 'lt10', '3')
 * @returns Object containing the parsed comparator and numeric value
 *
 * @example
 * ```typescript
 * parseOccurence('ge5') // returns { comparator: Comparators.GREATER_OR_EQUAL, value: 5 }
 * parseOccurence('lt10') // returns { comparator: Comparators.LESS, value: 10 }
 * parseOccurence('3') // returns { comparator: Comparators.GREATER_OR_EQUAL, value: 3 }
 * parseOccurence('invalid') // returns { comparator: Comparators.GREATER_OR_EQUAL, value: 1 }
 * ```
 */
export const parseOccurence = (value: string) => {
  const match = value.match(/^(eq|lt|le|gt|ge)?(-?\d*\.?\d*)$/)
  if (match) {
    const [, comparator, number] = match
    const criterion = {
      comparator: comparator ? filterToComparator(comparator) : Comparators.GREATER_OR_EQUAL,
      value: parseFloat(number)
    }
    return criterion
  } else {
    const criterion = {
      comparator: Comparators.GREATER_OR_EQUAL,
      value: 1
    }
    return criterion
  }
}
