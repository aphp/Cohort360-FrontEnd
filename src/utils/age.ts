import { CohortPatient } from 'types'
import moment from 'moment'
import { DurationType } from 'types/dates'
import { DurationRangeType } from 'types/searchCriterias'
import { getExtension } from './fhir'
import { PATIENT_TOTAL_AGE_DAYS_EXTENSION_NAME, PATIENT_TOTAL_AGE_MONTHS_EXTENSION_NAME } from 'constants.js'

export const getAgeAphp = (ageValue: number | undefined, momentUnit: 'days' | 'months'): string => {
  if (ageValue === 0 && momentUnit === 'months') return '< 1 mois'
  if (!ageValue) return 'Âge inconnu'
  let ageUnit: 'year' | 'month' | 'day' = 'year'
  let ageUnitDisplay = ''
  const momentAge = moment().subtract(ageValue, momentUnit)
  const today = moment()

  if (today.diff(momentAge, 'year') > 0) {
    ageUnit = 'year'
    ageUnitDisplay = 'ans'
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

export const getAge = (patient: CohortPatient): string => {
  const totalDays = getExtension(patient, PATIENT_TOTAL_AGE_DAYS_EXTENSION_NAME)
  const totalMonths = getExtension(patient, PATIENT_TOTAL_AGE_MONTHS_EXTENSION_NAME)
  if (totalDays) {
    return getAgeAphp(totalDays.valueInteger, 'days')
  } else if (totalMonths) {
    return getAgeAphp(totalMonths.valueInteger, 'months')
  }
  return 'Âge inconnu'
}

export const getDurationRangeLabel = (dates: DurationRangeType, keyword: string) => {
  const minDate: DurationType = convertStringToDuration(dates[0]) ?? { year: 0, month: 0, day: 0 }
  const maxDate: DurationType = convertStringToDuration(dates[1]) ?? { year: 130, month: 0, day: 0 }
  return `${keyword} entre
    ${
      minDate.year || minDate.month || minDate.day
        ? `${(minDate.year ?? 0) > 0 ? `${minDate.year} an(s) ` : ``}
          ${(minDate.month ?? 0) > 0 ? `${minDate.month} mois ` : ``}
          ${(minDate.day ?? 0) > 0 ? `${minDate.day} jour(s) ` : ``}`
        : 0
    }
  et
    ${(maxDate.year ?? 0) > 0 ? `${maxDate.year} an(s) ` : ``}
    ${(maxDate.month ?? 0) > 0 ? `${maxDate.month} mois ` : ``}
    ${(maxDate.day ?? 0) > 0 ? `${maxDate.day} jour(s) ` : ``}`
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
  if ((ageDate.year === 130 || ageDate.year === 0) && !ageDate.month && !ageDate.day) return null
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

export const convertDurationToTimestamp = (duration: DurationType | null, deidentified?: boolean): number => {
  if (!duration) return 0
  const year = duration.year ?? 0
  const month = duration.month ?? 0
  const day = duration.day ?? 0
  return year * (deidentified ? 12 : 365) + month * (deidentified ? 1 : 30) + day
}

export const convertTimestampToDuration = (timestamp: number | null, deidentified?: boolean): DurationType => {
  const duration: DurationType = { year: 130, month: 0, day: 0 }
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
