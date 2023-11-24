import { CohortPatient } from 'types'
import moment from 'moment'
import { DurationType, Calendar } from 'types/dates'
import { DurationRangeType } from 'types/searchCriterias'

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
    ageUnitDisplay = 'jours'
  } else {
    return 'Âge inconnu'
  }

  return `${today.diff(momentAge, ageUnit)} ${ageUnitDisplay}`
}

export const getAge = (patient: CohortPatient): string => {
  if (patient.extension) {
    const totalDays = patient.extension.find((item) => item.url?.includes('total-age-day'))
    const totalMonths = patient.extension.find((item) => item.url?.includes('total-age-month'))
    if (totalDays) {
      return getAgeAphp(totalDays.valueInteger, 'days')
    } else if (totalMonths) {
      return getAgeAphp(totalMonths.valueInteger, 'months')
    }
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
  const newAge: DurationType = {
    year: Number(age.split('/')[2]),
    month: Number(age.split('/')[1]),
    day: Number(age.split('/')[0])
  }
  return newAge
}

export const convertDurationToString = (ageDate: DurationType): string | null => {
  if (ageDate.year === null && ageDate.month === null && ageDate.day === null) return null
  if ((ageDate.year === 130 || ageDate.year === 0) && !ageDate.month && !ageDate.day) return null
  return `${ageDate.day || 0}/${ageDate.month || 0}/${ageDate.year || 0}`
}

export const checkRange = (key: string, value: number) => {
  if (key === Calendar.DAY && value <= 31 && value >= 0) {
    return true
  } else if (key === Calendar.MONTH && value <= 12 && value >= 0) {
    return true
  } else if (key === Calendar.YEAR && value >= 0) {
    return true
  }
  return false
}

export const checkMinMaxValue = (min: DurationType, max: DurationType) => {
  const maxDate: Date = substructDurationType(min)
  const minDate: Date = substructDurationType(max)

  if (minDate > maxDate) return false
  return true
}

export const convertDurationToTimestamp = (duration: DurationType | null): number => {
  if (!duration) return 0
  const year = duration.year ?? 0
  const month = duration.month ?? 0
  const day = duration.day ?? 0
  return year * 365 + month * 30 + day
}

export const convertTimestampToDuration = (timestamp: number | null): DurationType => {
  const duration: DurationType = { year: 130, month: 0, day: 0 }
  if (!timestamp) return duration
  duration.year = Math.floor(timestamp / 365)
  timestamp = timestamp % 365
  duration.month = Math.floor(timestamp / 30)
  timestamp = timestamp % 30
  duration.day = timestamp
  return duration
}
