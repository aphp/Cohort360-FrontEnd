import { CohortPatient } from 'types'
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
    let ageUnit = ''
    if (ageObj.url.includes('Years')) {
      ageUnit = 'ans'
    } else if (ageObj.url.includes('Months')) {
      ageUnit = 'mois'
    } else if (ageObj.url.includes('Days')) {
      ageUnit = 'jours'
    } else {
      return 'Âge inconnu'
    }

    return `${ageObj.valueInteger} ${ageUnit}`
  } else {
    return 'Âge inconnu'
  }
}

export const getAge = (patient: CohortPatient): string => {
  if (CONTEXT === 'aphp') {
    if (patient.extension) {
      return getAgeAphp(patient.extension.find((item) => item.url?.includes('Age')))
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
