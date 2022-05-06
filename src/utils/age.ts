import { CohortPatient } from 'types'
import moment from 'moment'

export const getAgeArkhn = (birthDate: Date, deathOrTodayDate = new Date()) => {
  const monthDifference = deathOrTodayDate.getMonth() - birthDate.getMonth()

  const age = deathOrTodayDate.getFullYear() - birthDate.getFullYear()
  if (monthDifference < 0 || (monthDifference === 0 && deathOrTodayDate.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
}

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
  const minDate: any = {}
  const maxDate: any = {}

  maxDate.year = moment().diff(moment(dates[0], 'YYYY-MM-DD'), 'year') || 0
  maxDate.month = moment().subtract(maxDate.year, 'year').diff(moment(dates[0], 'YYYY-MM-DD'), 'month')
  maxDate.days = moment()
    .subtract(maxDate.year, 'year')
    .subtract(maxDate.month, 'month')
    .diff(moment(dates[0], 'YYYY-MM-DD'), 'days')

  minDate.year = moment().diff(moment(dates[1], 'YYYY-MM-DD'), 'year') || 0
  minDate.month = moment().subtract(minDate.year, 'year').diff(moment(dates[1], 'YYYY-MM-DD'), 'month')
  minDate.days = moment()
    .subtract(minDate.year, 'year')
    .subtract(minDate.month, 'month')
    .diff(moment(dates[1], 'YYYY-MM-DD'), 'days')

  if (
    minDate.year === 0 &&
    minDate.month === 0 &&
    minDate.days === 0 &&
    maxDate.year === 130 &&
    maxDate.month === 0 &&
    maxDate.days === 0
  ) {
    return ''
  }

  return `Age entre
    ${
      minDate.year || minDate.month || minDate.days
        ? `${minDate.year > 0 ? `${minDate.year} an(s) ` : ``}
          ${minDate.month > 0 ? `${minDate.month} mois ` : ``}
          ${minDate.days > 0 ? `${minDate.days} jour(s) ` : ``}`
        : 0
    }
  et
    ${maxDate.year > 0 ? `${maxDate.year} an(s) ` : ``}
    ${maxDate.month > 0 ? `${maxDate.month} mois ` : ``}
    ${maxDate.days > 0 ? `${maxDate.days} jour(s) ` : ``}`
}
