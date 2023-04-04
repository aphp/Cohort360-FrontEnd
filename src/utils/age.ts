import { AgeRangeType, CohortPatient } from 'types'
import moment from 'moment'

export const getAgeAphp = (ageObj: any, momentUnit: 'days' | 'months') => {
  if (!ageObj) return 'Âge inconnu'
  let ageUnit: 'year' | 'month' | 'day' = 'year'
  let ageUnitDisplay = ''
  const momentAge = moment().subtract(ageObj.valueInteger, momentUnit)
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
    const totalDays = patient.extension.find((item) => item.url?.includes('Age(TotalDays)'))
    if (totalDays) {
      return getAgeAphp(totalDays, 'days')
    } else {
      const totalMonths = patient.extension.find((item) => item.url?.includes('Age(TotalMonths)'))
      return getAgeAphp(totalMonths, 'months')
    }
  }
  return 'Âge inconnu'
}

export const ageName = (dates: [string, string]) => {
  const minDate: AgeRangeType = convertStringToAgeRangeType(dates[1]) ?? { year: 0, month: 0, days: 0 }
  const maxDate: AgeRangeType = convertStringToAgeRangeType(dates[0]) ?? { year: 0, month: 0, days: 0 }

  if (
    !minDate.year &&
    !minDate.month &&
    !minDate.days &&
    (maxDate.year === 130 || !maxDate.year) &&
    !maxDate.month &&
    !maxDate.days
  ) {
    return ''
  }

  return `Age entre
    ${
      minDate.year || minDate.month || minDate.days
        ? `${(minDate.year ?? 0) > 0 ? `${minDate.year} an(s) ` : ``}
          ${(minDate.month ?? 0) > 0 ? `${minDate.month} mois ` : ``}
          ${(minDate.days ?? 0) > 0 ? `${minDate.days} jour(s) ` : ``}`
        : 0
    }
  et
    ${(maxDate.year ?? 0) > 0 ? `${maxDate.year} an(s) ` : ``}
    ${(maxDate.month ?? 0) > 0 ? `${maxDate.month} mois ` : ``}
    ${(maxDate.days ?? 0) > 0 ? `${maxDate.days} jour(s) ` : ``}`
}

export const substructAgeRangeType = (ageDate: AgeRangeType) => {
  if (!ageDate) return new Date()
  const today: Date = new Date()
  const newDate: Date = new Date(
    new Date().getUTCFullYear() - (ageDate.year ?? 0),
    today.getUTCMonth() - (ageDate.month ?? 0),
    today.getUTCDate() - (ageDate.days ?? 0),
    0,
    0,
    0
  )
  return newDate
}

export const substructAgeString = (range: string) => {
  const ageRangeType: AgeRangeType = convertStringToAgeRangeType(range) ?? { year: 0, month: 0, days: 0 }
  return substructAgeRangeType(ageRangeType)
}

export const convertStringToAgeRangeType = (age: string) => {
  if (!age) return undefined
  const newAge: AgeRangeType = {
    year: Number(age.split('/')[2]),
    month: Number(age.split('/')[1]),
    days: Number(age.split('/')[0])
  }
  return newAge
}

export const convertAgeRangeTypeToString = (ageDate: AgeRangeType) => {
  return ageDate.days + '/' + ageDate.month + '/' + ageDate.year
}
