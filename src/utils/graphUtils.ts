import {
  PatientGenderKind,
  IPatient,
  IEncounter,
  IExtension
  // IReference
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { getAgeArkhn } from './age'
import { SimpleChartDataType, GenderRepartitionType, AgeRepartitionType, VisiteRepartitionType } from 'types'
import { getStringMonth, getStringMonthAphp } from './formatDate'

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const getVisitTypeName = (visitType?: string) => {
  let name = ''

  switch (visitType) {
    case 'ext':
      name = 'Consultation externe'
      break
    case 'incomp':
      name = 'Hospitalisation incomplète'
      break
    case 'urg':
      name = 'Urgence'
      break
    case 'hosp':
      name = 'Hospitalisation'
      break
    default:
      name = 'Autres visites'
  }

  return name
}

const getVisitTypeColor = (visitType?: string) => {
  let color = ''

  switch (visitType) {
    case 'ext':
      color = '#FFE755'
      break
    case 'incomp':
      color = '#78D4FA'
      break
    case 'urg':
      color = '#FC5656'
      break
    case 'hosp':
      color = '#BDEA88'
      break
    default:
      color = '#FCA355'
  }

  return color
}

export const getGenderRepartitionMapAphp = (facet?: IExtension[]): GenderRepartitionType => {
  const repartitionMap = {
    female: { deceased: 0, alive: 0 },
    male: { deceased: 0, alive: 0 },
    other: { deceased: 0, alive: 0 },
    unknown: { deceased: 0, alive: 0 }
  }

  facet?.forEach((extension) => {
    const isDeceased = extension.extension?.filter((extension) => {
      return extension.url === 'true' || extension.url === 'false'
    })[0].url

    const genderData = extension.extension?.filter((extension) => {
      return extension.url === 'gender-simple'
    })[0].extension

    if (isDeceased === 'true') {
      genderData?.forEach((gender) => {
        switch (gender.url) {
          case 'female':
            repartitionMap.female.deceased = gender.valueDecimal ?? 0
            break
          case 'male':
            repartitionMap.male.deceased = gender.valueDecimal ?? 0
            break
          default:
            repartitionMap.other.deceased = gender?.valueDecimal ?? 0
        }
      })
    } else if (isDeceased === 'false') {
      genderData?.forEach((gender) => {
        switch (gender.url) {
          case 'female':
            repartitionMap.female.alive = gender.valueDecimal ?? 0
            break
          case 'male':
            repartitionMap.male.alive = gender.valueDecimal ?? 0
            break
          default:
            repartitionMap.other.alive = gender?.valueDecimal ?? 0
        }
      })
    }
  })

  return repartitionMap
}

export const getGenderRepartitionMap = (patients: IPatient[]): GenderRepartitionType => {
  const repartitionMap = {
    female: { deceased: 0, alive: 0 },
    male: { deceased: 0, alive: 0 },
    other: { deceased: 0, alive: 0 },
    unknown: { deceased: 0, alive: 0 }
  }

  patients.forEach((patient) => {
    const gender: 'female' | 'male' | 'other' | 'unknown' = patient.gender || 'unknown'

    if (patient.deceasedDateTime) {
      repartitionMap[gender].deceased += 1
    } else {
      repartitionMap[gender].alive += 1
    }
  })

  return repartitionMap
}

export const getEncounterRepartitionMapAphp = (extension?: IExtension[]): SimpleChartDataType[] => {
  const data: SimpleChartDataType[] = []
  let otherVisits = 0

  extension?.forEach((visitType) => {
    const visitTypeUrl = visitType.extension?.[0].url

    if (visitTypeUrl === 'ext' || visitTypeUrl === 'hosp' || visitTypeUrl === 'incomp' || visitTypeUrl === 'urg') {
      data.push({
        label: getVisitTypeName(visitTypeUrl),
        value: visitType.extension?.[0].valueDecimal ?? 0,
        color: getVisitTypeColor(visitTypeUrl)
      })
    } else {
      otherVisits += visitType.extension?.[0].valueDecimal ?? 0
    }
  })

  data.push({
    label: getVisitTypeName('other'),
    value: otherVisits,
    color: getVisitTypeColor('other')
  })

  return data
}

export const getEncounterRepartitionMap = (encounters: IEncounter[]): SimpleChartDataType[] => {
  const data: SimpleChartDataType[] = []

  encounters.forEach((encounter) => {
    let encounterDataIndex = data.findIndex((d) => d.label === encounter.class.code)
    if (encounter.class.code && encounterDataIndex === -1) {
      encounterDataIndex = data.length
      data.push({
        label: encounter.class.code,
        value: 0,
        color: getRandomColor()
      })
    }
    data[encounterDataIndex] = {
      ...data[encounterDataIndex],
      value: data[encounterDataIndex].value + 1
    }
  })

  return data
}

export const getAgeRepartitionMapAphp = (facet?: IExtension[]): AgeRepartitionType => {
  const repartitionMap = new Array(130).map(() => ({ male: 0, female: 0, other: 0 }))

  facet?.forEach((extension) => {
    const ageObj = extension.extension?.filter((object) => {
      return object.url !== 'gender-simple'
    })?.[0].url

    const genderValuesObj = extension.extension?.filter((object) => {
      return object.url === 'gender-simple'
    })?.[0]

    if (ageObj) {
      const age: number = parseInt(ageObj, 10) / 12

      if (!repartitionMap[age]) {
        repartitionMap[age] = { male: 0, female: 0, other: 0 }
      }

      if (genderValuesObj) {
        const genderValues = genderValuesObj.extension

        genderValues?.forEach((genderValue) => {
          switch (genderValue.url) {
            case 'female':
              repartitionMap[age].female = genderValue.valueDecimal ?? 0
              break
            case 'male':
              repartitionMap[age].male = genderValue.valueDecimal ?? 0
              break
            default:
              repartitionMap[age].other = genderValue.valueDecimal ?? 0
          }
        })
      }
    }
  })

  return repartitionMap
}

export const getAgeRepartitionMap = (patients: IPatient[]): AgeRepartitionType => {
  const repartitionMap = new Array(130).map(() => ({ male: 0, female: 0, other: 0 }))

  patients.forEach((patient) => {
    if (patient.birthDate) {
      const age = getAgeArkhn(
        new Date(patient.birthDate),
        patient.deceasedDateTime ? new Date(patient.deceasedDateTime) : new Date()
      )
      if (!repartitionMap[age]) {
        repartitionMap[age] = { male: 0, female: 0, other: 0 }
      }

      switch (patient.gender) {
        case 'female':
          if (!repartitionMap[age].female) repartitionMap[age].female = 0
          repartitionMap[age].female += 1
          break
        case 'male':
          if (!repartitionMap[age].male) repartitionMap[age].male = 0
          repartitionMap[age].male += 1
          break
        default:
          if (!repartitionMap[age].other) repartitionMap[age].other = 0
          repartitionMap[age].other += 1
          break
      }
    }
  })

  return repartitionMap
}

export const getVisitRepartitionMapAphp = (facet?: IExtension[]): VisiteRepartitionType => {
  const repartitionMap: VisiteRepartitionType = {
    Janvier: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Février: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Mars: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Avril: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Mai: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Juin: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Juillet: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Août: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Septembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Octobre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Novembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Decembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 }
  }

  facet?.forEach((object) => {
    const data = object.extension

    if (data) {
      const values = data[0].url?.split('-')

      if (values) {
        const month = getStringMonthAphp(parseInt(values[1] ?? 'Inconnu', 10))
        if (month && values[2]) {
          switch (values[2]) {
            case 'female':
              repartitionMap[month].female += parseInt(`${data[0].valueDecimal ?? 0}`)
              repartitionMap[month].femaleCount += 1
              break
            case 'male':
              repartitionMap[month].male += parseInt(`${data[0].valueDecimal ?? 0}`)
              repartitionMap[month].maleCount += 1
              break
            default:
              repartitionMap[month].other += parseInt(`${data[0].valueDecimal ?? 0}`)
              repartitionMap[month].otherCount += 1
              break
          }
        }
      }
    }
  })

  // Idiot de TS...... Don't forget the type !
  const months: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre'
  ] = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre'
  ]
  for (const month of months) {
    if (!repartitionMap[month]) continue
    repartitionMap[month].male = repartitionMap[month].male / repartitionMap[month].maleCount
    repartitionMap[month].female = repartitionMap[month].female / repartitionMap[month].femaleCount
    repartitionMap[month].other = repartitionMap[month].other / repartitionMap[month].otherCount
  }

  return repartitionMap
}

export const getVisitRepartitionMap = (patients: IPatient[], encounters: IEncounter[]): VisiteRepartitionType => {
  const repartitionMap = {
    Janvier: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Février: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Mars: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Avril: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Mai: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Juin: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Juillet: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Août: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Septembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Octobre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Novembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 },
    Decembre: { male: 0, maleCount: 0, female: 0, femaleCount: 0, other: 0, otherCount: 0 }
  }

  encounters.forEach((encounter) => {
    if (encounter.subject?.reference && encounter.period && encounter.period.start) {
      const patient = patients.find((p) => encounter.subject?.reference === `Patient/${p.id}`)
      const month = new Date(encounter.period.start).getMonth()
      const monthStr = getStringMonth(month)
      if (monthStr && patient) {
        switch (patient.gender) {
          case 'male':
            repartitionMap[monthStr].male += 1
            break
          case 'female':
            repartitionMap[monthStr].female += 1
            break

          default:
            repartitionMap[monthStr].other += 1
            break
        }
      }
    }
  })
  return repartitionMap
}

export const getGenderRepartitionSimpleData = (
  genderRepartitionMap?: GenderRepartitionType
): {
  vitalStatusData?: SimpleChartDataType[]
  genderData?: SimpleChartDataType[]
} => {
  const vitalStatusData: SimpleChartDataType[] = []
  const genderData: SimpleChartDataType[] = []

  if (!genderRepartitionMap) return { vitalStatusData: undefined, genderData: undefined }

  const keys: ['male', 'female', 'other', 'unknown'] = ['male', 'female', 'other', 'unknown']
  if (keys && keys.length > 0) {
    let aliveCount = 0
    let deceasedCount = 0
    let maleCount = 0
    let femaleCount = 0
    let unknownCount = 0
    let otherCount = 0
    for (const gender of keys) {
      const genderValues = genderRepartitionMap[gender] || { deceased: 0, alive: 0 }
      const genderTotal = genderValues.alive + genderValues.deceased
      aliveCount += genderValues.alive
      deceasedCount += genderValues.deceased

      switch (gender) {
        case PatientGenderKind._male:
          maleCount += genderTotal
          break
        case PatientGenderKind._female:
          femaleCount += genderTotal
          break
        case PatientGenderKind._unknown:
          unknownCount += genderTotal
          break
        case PatientGenderKind._other:
          otherCount += genderTotal
          break

        default:
          break
      }
    }

    vitalStatusData.push({
      label: 'Patients vivants',
      value: aliveCount,
      color: '#6DF2E3'
    })
    vitalStatusData.push({
      label: 'Patients décédés',
      value: deceasedCount,
      color: '#D0D7D8'
    })

    maleCount &&
      genderData.push({
        label: 'Hommes',
        value: maleCount,
        color: '#78D4FA'
      })
    femaleCount &&
      genderData.push({
        label: 'Femmes',
        value: femaleCount,
        color: '#FC568F'
      })
    unknownCount &&
      genderData.push({
        label: 'Inconnus',
        value: unknownCount,
        color: '#8446E4'
      })
    otherCount &&
      genderData.push({
        label: 'Autres',
        value: otherCount,
        color: '#FCE756'
      })
  }
  return { vitalStatusData, genderData }
}
