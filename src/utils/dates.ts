/**
 * @fileoverview Utility functions for dates
 * @module utils/dates
 */

import moment from 'moment'
import { Month } from 'types'

/**
 * Generic function to group items by date field
 *
 * @param items - Array of items to group
 * @param dateKey - Key of the date field in the item objects
 * @param dateFormat - Format string for date display (default: 'DD/MM/YYYY')
 * @returns Array of tuples containing formatted date strings and their corresponding items, sorted by date (newest first)
 *
 * @example
 * ```typescript
 * const events = [
 *   { name: 'Event 1', eventDate: '2023-12-25T10:00:00Z' },
 *   { name: 'Event 2', eventDate: '2023-12-24T14:00:00Z' }
 * ]
 * groupByDate(events, 'eventDate')
 * // returns [
 * //   ['25/12/2023', [event1]],
 * //   ['24/12/2023', [event2]]
 * // ]
 * ```
 */
export function groupByDate<T>(items: T[], dateKey: keyof T, dateFormat = 'DD/MM/YYYY'): [string, T[]][] {
  const grouped = items.reduce(
    (acc, item) => {
      const dateValue = item[dateKey]
      const date = moment(dateValue as string).format(dateFormat)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )

  // Sort dates in descending order
  return Object.entries(grouped).sort(([a], [b]) => {
    return moment(b, dateFormat).valueOf() - moment(a, dateFormat).valueOf()
  })
}

/**
 * Validates if a date string is valid according to the specified format
 *
 * @param date - The date string to validate
 * @param format - The expected format (defaults to 'YYYY-MM-DD')
 * @returns True if the date is valid, false otherwise
 *
 * @example
 * ```typescript
 * isDateValid('2023-12-25') // returns true
 * isDateValid('2023-13-25') // returns false
 * isDateValid('25/12/2023', 'DD/MM/YYYY') // returns true
 * ```
 */
export const isDateValid = (date?: string | null, format = 'YYYY-MM-DD') => {
  if (!date) return false
  return moment(date, format, true).isValid()
}

export const isDateBefore = (date: string, nbDays: number) => {
  const inputDate = new Date(date)
  const now = new Date()
  const diffMs = Math.abs(now.getTime() - inputDate.getTime())
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < nbDays) return false
  return true
}

/**
 * Formats a date string to French format (DD/MM/YYYY) with optional time
 *
 * @param date - The date string to format
 * @param withHour - Whether to include time in the format
 * @returns Formatted date string or 'N/A' if invalid
 *
 * @example
 * ```typescript
 * formatDate('2023-12-25') // returns '25/12/2023'
 * formatDate('2023-12-25T14:30:00', true) // returns '25/12/2023 - 14:30:00'
 * ```
 */
export const formatDate = (date?: string, withHour?: boolean) => {
  const _date = moment(date)
  const format = `DD/MM/YYYY${withHour ? ' - HH:mm' : ''}`
  return date && _date.isValid() ? _date.format(format) : 'N/A'
}

/**
 * Converts a zero-based month number to its French string representation
 *
 * @param monthNumber - The month number (0-11)
 * @returns The corresponding Month enum value or undefined
 *
 * @example
 * ```typescript
 * getStringMonth(0) // returns Month.JANUARY
 * getStringMonth(11) // returns Month.DECEMBER
 * ```
 */
export const getStringMonth = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 0:
      return Month.JANUARY
    case 1:
      return Month.FEBRUARY
    case 2:
      return Month.MARCH
    case 3:
      return Month.APRIL
    case 4:
      return Month.MAY
    case 5:
      return Month.JUNE
    case 6:
      return Month.JULY
    case 7:
      return Month.AUGUST
    case 8:
      return Month.SEPTEMBER
    case 9:
      return Month.OCTOBER
    case 10:
      return Month.NOVEMBER
    case 11:
      return Month.DECEMBER

    default:
      return
  }
}

/**
 * Converts a one-based month number to its French string representation (APHP format)
 *
 * @param monthNumber - The month number (1-12)
 * @returns The corresponding Month enum value or undefined
 *
 * @example
 * ```typescript
 * getStringMonthAphp(1) // returns Month.JANUARY
 * getStringMonthAphp(12) // returns Month.DECEMBER
 * ```
 */
export const getStringMonthAphp = (monthNumber: number): Month | undefined => {
  switch (monthNumber) {
    case 1:
      return Month.JANUARY
    case 2:
      return Month.FEBRUARY
    case 3:
      return Month.MARCH
    case 4:
      return Month.APRIL
    case 5:
      return Month.MAY
    case 6:
      return Month.JUNE
    case 7:
      return Month.JULY
    case 8:
      return Month.AUGUST
    case 9:
      return Month.SEPTEMBER
    case 10:
      return Month.OCTOBER
    case 11:
      return Month.NOVEMBER
    case 12:
      return Month.DECEMBER

    default:
      return
  }
}

/**
 * Calculates the number of days between a given date and today
 *
 * @param date - The target date
 * @returns The number of days difference (positive for future dates, negative for past dates)
 *
 * @example
 * ```typescript
 * getDaysLeft(new Date('2024-01-01')) // returns number of days until/since Jan 1, 2024
 * ```
 */
export const getDaysLeft = (date: Date): number => {
  return moment(date).diff(new Date(), 'days')
}
