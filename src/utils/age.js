export const getAge = (birthDate, deathOrTodayDate = Date()) => {
  const monthDifference = deathOrTodayDate.getMonth() - birthDate.getMonth()

  const age = deathOrTodayDate.getFullYear() - birthDate.getFullYear()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && deathOrTodayDate.getDate() < birthDate.getDate())
  ) {
    return age - 1
  }
  return age
}

export const getAgeAphp = (ageObj) => {
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
