import { CohortPatient } from 'types'
import moment from 'moment'
import { DurationType } from 'types/dates'
import { DurationRangeType } from 'types/searchCriterias'
import { getExtension } from './fhir'
import { getConfig } from 'config'

const formatAgeFromDiff = (years: number, months: number, days: number): string => {
  if (years > 0) {
    return `${years} ${years <= 1 ? 'an' : 'ans'}`
  } else if (months > 0) {
    return `${months} mois`
  } else if (days >= 0) {
    return `${days} ${days <= 1 ? 'jour' : 'jours'}`
  } else {
    return 'Âge inconnu'
  }
}

export const getAgeAphp = (ageValue: number | undefined, momentUnit: 'days' | 'months'): string => {
  if (ageValue === 0 && momentUnit === 'months') return '< 1 mois'
  if (ageValue === undefined) return 'Âge inconnu'
  const momentAge = moment().subtract(ageValue, momentUnit)
  const today = moment()

  const years = today.diff(momentAge, 'year')
  const months = today.diff(momentAge, 'month')
  const days = today.diff(momentAge, 'day')

  return formatAgeFromDiff(years, months, days)
}

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
    const years = endDate.diff(birthDate, 'years')
    const months = endDate.diff(birthDate, 'months')
    const days = endDate.diff(birthDate, 'days')

    return formatAgeFromDiff(years, months, days)
  }
  return 'Âge inconnu'
}

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

export const substructAgeString = (range: string): Date => {
  const DurationType: DurationType = convertStringToDuration(range) ?? { year: 0, month: 0, day: 0 }
  return substructDurationType(DurationType)
}

export const convertStringToDuration = (age: string | null | undefined): DurationType | null => {
  if (!age) return null
  const splitDate = age.split('/')
  return {
    year: Number(splitDate?.[2] || 0),
    month: Number(splitDate?.[1] || 0),
    day: Number(splitDate?.[0] || 0)
  }
}

export const convertDurationToString = (ageDate: DurationType): string | null => {
  if (ageDate.year === null && ageDate.month === null && ageDate.day === null) return null
  if (ageDate.year === 0 && !ageDate.month && !ageDate.day) return null
  return `${ageDate.day || 0}/${ageDate.month || 0}/${ageDate.year || 0}`
}

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

export const convertDurationToTimestamp = (duration: DurationType | null, deidentified?: boolean): number | null => {
  if (!duration) return null
  const year = duration.year ?? 0
  const month = duration.month ?? 0
  const day = duration.day ?? 0
  return year * (deidentified ? 12 : 365) + month * (deidentified ? 1 : 30) + day
}

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
