/**
 * @fileoverview Utility functions for age calculations, duration formatting, and temporal operations
 * @module utils/age
 */

import { CohortPatient } from 'types'
import moment from 'moment'
import { DurationType } from 'types/dates'
import { DurationRangeType } from 'types/searchCriterias'
import { getExtension } from './fhir'
import { getConfig } from 'config'

/**
 * Calculates age in French format from a numeric value and time unit
 *
 * @param ageValue - The age value to convert
 * @param momentUnit - The unit of the age value ('days' or 'months')
 * @returns A formatted age string in French
 *
 * @example
 * ```typescript
 * getAgeAphp(365, 'days') // returns '1 an'
 * getAgeAphp(0, 'months') // returns '< 1 mois'
 * ```
 */
export const getAgeAphp = (ageValue: number | undefined, momentUnit: 'days' | 'months'): string => {
  if (ageValue === 0 && momentUnit === 'months') return '< 1 mois'
  if (ageValue === undefined) return 'Âge inconnu'
  let ageUnit: 'year' | 'month' | 'day' = 'year'
  let ageUnitDisplay = ''
  const momentAge = moment().subtract(ageValue, momentUnit)
  const today = moment()

  if (today.diff(momentAge, 'year') > 0) {
    ageUnit = 'year'
    ageUnitDisplay = today.diff(momentAge, 'year') <= 1 ? 'an' : 'ans'
  } else if (today.diff(momentAge, 'month') > 0) {
    ageUnit = 'month'
    ageUnitDisplay = 'mois'
  } else if (today.diff(momentAge, 'day') >= 0) {
    ageUnit = 'day'
    ageUnitDisplay = today.diff(momentAge, 'day') <= 1 ? 'jour' : 'jours'
  } else {
    return 'Âge inconnu'
  }

  return `${today.diff(momentAge, ageUnit)} ${ageUnitDisplay}`
}

/**
 * Calculates the age of a patient based on their birth date and extensions
 *
 * @param patient - The patient data object
 * @returns A formatted age string in French
 *
 * @example
 * ```typescript
 * getAge(patient) // returns '25 ans' or 'Âge inconnu'
 * ```
 */
export const getAge = (patient: CohortPatient): string => {
  const appConfig = getConfig()
  const totalDays = getExtension(patient, appConfig.core.extensions.patientTotalAgeDaysExtensionUrl)
  const totalMonths = getExtension(patient, appConfig.core.extensions.patientTotalAgeMonthsExtensionUrl)
  if (totalDays) {
    return getAgeAphp(totalDays.valueInteger, 'days')
  } else if (totalMonths) {
    return getAgeAphp(totalMonths.valueInteger, 'months')
  }
  if (patient.birthDate) {
    const birthDate = moment(patient.birthDate)
    const endDate = patient.deceasedDateTime ? moment(patient.deceasedDateTime) : moment()
    if (patient.deceasedBoolean && !patient.deceasedDateTime) return 'Âge inconnu'
    const age = endDate.diff(birthDate, 'years')
    if (age > 0) return `${age} an(s)`
    const ageMonth = endDate.diff(birthDate, 'months')
    if (ageMonth > 0) return `${ageMonth} mois`
    const ageDay = endDate.diff(birthDate, 'days')
    return `${ageDay} jour(s)`
  }
  return 'Âge inconnu'
}

/**
 * Formats an age string from one format to another
 *
 * @param input - The input age string to format
 * @param fromFormat - The source format pattern
 * @param toFormat - The target format pattern
 * @returns The reformatted age string
 *
 * @throws Error when format patterns or input are invalid
 *
 * @example
 * ```typescript
 * formatAge('25/12/1990', 'DD/MM/YYYY', 'YYYY-MM-DD') // returns '1990-12-25'
 * ```
 */
export const formatAge = (input: string, fromFormat: string, toFormat: string): string => {
  const getSeparator = (format: string): string => {
    const match = format.match(/[^A-Z]/i)
    return match ? match[0] : ''
  }

  const fromSep = getSeparator(fromFormat)
  const toSep = getSeparator(toFormat) || fromSep

  const fromParts = fromFormat.split(fromSep)
  const toParts = toFormat.split(toSep)
  const values = input.split(fromSep)

  if (fromParts.length !== 3 || toParts.length !== 3 || values.length !== 3) {
    throw new Error('Invalid date format or input')
  }

  const map: Record<string, string> = {}
  fromParts.forEach((part, i) => {
    map[part] = values[i]
  })

  return toParts.map((part) => map[part]).join(toSep)
}

/**
 * Generates a human-readable label for a duration range in French
 *
 * @param dates - Array containing start and end duration strings
 * @param keyword - The keyword to use in the label (e.g., 'Âge')
 * @returns A formatted duration range label in French
 *
 * @example
 * ```typescript
 * getDurationRangeLabel(['1/0/25', '1/0/65'], 'Âge')
 * // returns 'Âge entre 25 an(s) et 65 an(s)'
 * ```
 */
export const getDurationRangeLabel = (dates: DurationRangeType, keyword: string) => {
  const minDate: DurationType = convertStringToDuration(dates[0]) || { year: 0, month: 0, day: 0 }
  const maxDate: DurationType = convertStringToDuration(dates[1]) || { year: 0, month: 0, day: 0 }

  if (dates[0] && dates[1]) {
    return `${keyword} entre
    ${`${(minDate.year ?? 0) > 0 ? `${minDate.year} an(s) ` : ``}
          ${(minDate.month ?? 0) > 0 ? `${minDate.month} mois ` : ``}
          ${(minDate.day ?? 0) > 0 ? `${minDate.day} jour(s) ` : ``}`}
  et
    ${(maxDate.year ?? 0) > 0 ? `${maxDate.year} an(s) ` : ``}
    ${(maxDate.month ?? 0) > 0 ? `${maxDate.month} mois ` : ``}
    ${(maxDate.day ?? 0) > 0 ? `${maxDate.day} jour(s) ` : ``}`
  }
  if (dates[0] && !dates[1]) {
    return `${keyword} à partir de
    ${`${(minDate.year ?? 0) > 0 ? `${minDate.year} an(s) ` : ``}
          ${(minDate.month ?? 0) > 0 ? `${minDate.month} mois ` : ``}
          ${(minDate.day ?? 0) > 0 ? `${minDate.day} jour(s) ` : ``}`}`
  }
  if (!dates[0] && dates[1]) {
    return `${keyword} au maximum de
      ${(maxDate.year ?? 0) > 0 ? `${maxDate.year} an(s) ` : ``}
      ${(maxDate.month ?? 0) > 0 ? `${maxDate.month} mois ` : ``}
      ${(maxDate.day ?? 0) > 0 ? `${maxDate.day} jour(s) ` : ``}`
  }
  return ''
}

/**
 * Subtracts a duration from the current date to get a past date
 *
 * @param ageDate - The duration to subtract from current date
 * @returns A Date object representing the calculated past date
 *
 * @example
 * ```typescript
 * substructDurationType({ year: 25, month: 6, day: 15 }) // returns date 25 years, 6 months, 15 days ago
 * ```
 */
export const substructDurationType = (ageDate: DurationType): Date => {
  if (!ageDate) return new Date()
  const today: Date = new Date()
  const newDate: Date = new Date(
    new Date().getUTCFullYear() - (ageDate.year ?? 0),
    today.getUTCMonth() - (ageDate.month ?? 0),
    today.getUTCDate() - (ageDate.day ?? 0),
    0,
    0,
    0
  )
  return newDate
}

/**
 * Converts a duration string to a past date by subtracting it from current date
 *
 * @param range - The duration string to convert and subtract
 * @returns A Date object representing the calculated past date
 *
 * @example
 * ```typescript
 * substructAgeString('15/6/25') // returns date 25 years, 6 months, 15 days ago
 * ```
 */
export const substructAgeString = (range: string): Date => {
  const DurationType: DurationType = convertStringToDuration(range) ?? { year: 0, month: 0, day: 0 }
  return substructDurationType(DurationType)
}

/**
 * Converts a duration string in DD/MM/YYYY format to a DurationType object
 *
 * @param age - The duration string to convert
 * @returns A DurationType object or null if input is invalid
 *
 * @example
 * ```typescript
 * convertStringToDuration('15/6/25') // returns { day: 15, month: 6, year: 25 }
 * convertStringToDuration(null) // returns null
 * ```
 */
export const convertStringToDuration = (age: string | null | undefined): DurationType | null => {
  if (!age) return null
  const splitDate = age.split('/')
  return {
    year: Number(splitDate?.[2] || 0),
    month: Number(splitDate?.[1] || 0),
    day: Number(splitDate?.[0] || 0)
  }
}

/**
 * Converts a DurationType object to a duration string in DD/MM/YYYY format
 *
 * @param ageDate - The DurationType object to convert
 * @returns A formatted duration string or null if all values are null/zero
 *
 * @example
 * ```typescript
 * convertDurationToString({ day: 15, month: 6, year: 25 }) // returns '15/6/25'
 * ```
 */
export const convertDurationToString = (ageDate: DurationType): string | null => {
  if (ageDate.year === null && ageDate.month === null && ageDate.day === null) return null
  if (ageDate.year === 0 && !ageDate.month && !ageDate.day) return null
  return `${ageDate.day || 0}/${ageDate.month || 0}/${ageDate.year || 0}`
}

/**
 * Validates that min and max duration values are properly ordered
 *
 * @param min - The minimum duration value
 * @param max - The maximum duration value
 * @returns True if values are valid, false if min > max
 *
 * @example
 * ```typescript
 * checkMinMaxValue({ year: 18, month: 0, day: 0 }, { year: 65, month: 0, day: 0 }) // returns true
 * ```
 */
export const checkMinMaxValue = (min: DurationType, max: DurationType) => {
  const maxDate: Date = substructDurationType(min)
  const minDate: Date = substructDurationType(max)
  const error =
    (min.year === null && min.month === null && min.day === null) ||
    (max.year === null && max.month === null && max.day === null)
      ? true
      : false

  if (error === true) return true
  if (minDate > maxDate) return false
  return true
}

/**
 * Converts a duration to a timestamp representation
 *
 * @param duration - The duration to convert
 * @param deidentified - Whether to use deidentified time units (12 months/year vs 365 days)
 * @returns A numeric timestamp or null if duration is null
 *
 * @example
 * ```typescript
 * convertDurationToTimestamp({ year: 1, month: 6, day: 15 }, false) // returns 365 + 180 + 15 = 560
 * ```
 */
export const convertDurationToTimestamp = (duration: DurationType | null, deidentified?: boolean): number | null => {
  if (!duration) return null
  const year = duration.year ?? 0
  const month = duration.month ?? 0
  const day = duration.day ?? 0
  return year * (deidentified ? 12 : 365) + month * (deidentified ? 1 : 30) + day
}

/**
 * Converts a timestamp back to a duration representation
 *
 * @param timestamp - The timestamp to convert
 * @param deidentified - Whether to use deidentified time units (12 months/year vs 365 days)
 * @returns A DurationType object representing the duration
 *
 * @example
 * ```typescript
 * convertTimestampToDuration(560, false) // returns { year: 1, month: 6, day: 15 }
 * ```
 */
export const convertTimestampToDuration = (timestamp: number | null, deidentified?: boolean): DurationType => {
  const duration: DurationType = { year: 0, month: 0, day: 0 }
  if (!timestamp) return duration
  duration.year = Math.floor(timestamp / (deidentified ? 12 : 365))
  timestamp = timestamp % (deidentified ? 12 : 365)
  duration.month = Math.floor(timestamp / (deidentified ? 1 : 30))
  if (!deidentified) {
    timestamp = timestamp % 30
    duration.day = timestamp
  }
  return duration
}
