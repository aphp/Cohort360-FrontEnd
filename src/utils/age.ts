import { CohortPatient } from 'types'
import moment from 'moment'
import { DateRange } from 'types/searchCriterias'
import { AgeRangeType, Calendar } from 'types/dates'

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

export const ageName = (dates: DateRange) => {
  const minDate: AgeRangeType = convertStringToAgeRangeType(dates[0]) ?? { year: 0, month: 0, day: 0 }
  const maxDate: AgeRangeType = convertStringToAgeRangeType(dates[1]) ?? { year: 130, month: 0, day: 0 }

  if (
    !minDate.year &&
    !minDate.month &&
    !minDate.day &&
    (maxDate.year === 130 || !maxDate.year) &&
    !maxDate.month &&
    !maxDate.day
  ) {
    return ''
  }

  return `Âge entre
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

export const substructAgeRangeType = (ageDate: AgeRangeType): Date => {
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
  const ageRangeType: AgeRangeType = convertStringToAgeRangeType(range) ?? { year: 0, month: 0, day: 0 }
  return substructAgeRangeType(ageRangeType)
}

export const convertStringToAgeRangeType = (age: string | null): AgeRangeType | null => {
  if (!age) return null
  const newAge: AgeRangeType = {
    year: Number(age.split('/')[2]),
    month: Number(age.split('/')[1]),
    day: Number(age.split('/')[0])
  }
  return newAge
}

export const convertAgeRangeTypeToString = (ageDate: AgeRangeType): string | null => {
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

export const checkMinMaxValue = (min: AgeRangeType, max: AgeRangeType) => {
  const maxDate: Date = substructAgeRangeType(min)
  const minDate: Date = substructAgeRangeType(max)

  if (minDate > maxDate) return false
  return true
}
