import { CohortPatient } from 'types'
import moment from 'moment'
import { CONTEXT } from '../constants'

export const getAgeArkhn = (birthDate: Date, deathOrTodayDate = new Date()) => {
  const monthDifference = deathOrTodayDate.getMonth() - birthDate.getMonth()

  const age = deathOrTodayDate.getFullYear() - birthDate.getFullYear()
  if (monthDifference < 0 || (monthDifference === 0 && deathOrTodayDate.getDate() < birthDate.getDate())) {
    return age - 1
  }
  return age
}

export const getAgeAphp = (ageObj: any) => {
  if (ageObj.valueInteger) {
    let ageUnit: 'year' | 'month' | 'day' = 'year'
    let ageUnitDisplay = ''
    const momentAge = moment().subtract(ageObj.valueInteger, 'days')
    const today = moment()

    if (today.diff(momentAge, 'year') > 0) {
      ageUnit = 'year'
      ageUnitDisplay = 'ans'
    } else if (today.diff(momentAge, 'month') > 0) {
      ageUnit = 'month'
      ageUnitDisplay = 'mois'
    } else if (today.diff(momentAge, 'day') > 0) {
      ageUnit = 'day'
      ageUnitDisplay = 'jours'
    } else {
      return 'Âge inconnu'
    }

    return `${today.diff(momentAge, ageUnit)} ${ageUnitDisplay}`
  } else {
    return 'Âge inconnu'
  }
}

export const getAge = (patient: CohortPatient): string => {
  if (CONTEXT === 'aphp') {
    if (patient.extension) {
      return getAgeAphp(patient.extension.find((item) => item.url?.includes('Age(TotalDays)')))
    }
  } else if (CONTEXT === 'arkhn') {
    if (patient.birthDate) {
      return getAgeArkhn(
        new Date(patient.birthDate),
        patient.deceasedDateTime ? new Date(patient.deceasedDateTime) : new Date()
      ).toString()
    }
  }
  return 'Âge inconnu'
}
