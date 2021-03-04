import moment from 'moment'

import { fetchPerimeterInfoForRequeteur as fetchPopulation } from '../services/perimeters'
import { ScopeTreeRow, SelectedCriteriaType, CriteriaGroupType } from 'types'

const RESSOURCE_TYPE_PATIENT: 'Patient' = 'Patient'
const PATIENT_GENDER = 'gender' // ok
const PATIENT_BIRTHDATE = 'birthdate' // ok
const PATIENT_DECEASED = 'deceased' // ok

const RESSOURCE_TYPE_ENCOUNTER: 'Encounter' = 'Encounter'
const ENCOUNTER_LENGTH = 'length' // ok
const ENCOUNTER_BIRTHDATE = 'patient.birthdate' // ok
const ENCOUNTER_ADMISSIONMODE = 'admissionMode' // on verra
const ENCOUNTER_ENTRYMODE = 'entryMode' // on verra
const ENCOUNTER_EXITMODE = 'exitMode' // on verra
const ENCOUNTER_FILESTATUS = 'fileStatus' // on verra

const RESSOURCE_TYPE_CLAIM: 'Claim' = 'Claim'
const CLAIM_CODE = 'diagnosis' // ok
const CLAIM_DATE = 'created' // ok
const CLAIM_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_PROCEDURE: 'Procedure' = 'Procedure'
const PROCEDURE_CODE = 'code' // ok
const PROCEDURE_DATE = 'date' // ok
const PROCEDURE_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_CONDITION: 'Condition' = 'Condition' // ok
const CONDITION_CODE = 'code' // ok
const CONDITION_TYPE = 'type' // ok
const CONDITION_DATE = 'recorded-date' // ok
const CONDITION_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_COMPOSITION: 'Composition' = 'Composition'
const COMPOSITION_TEXT = '_text' // ok
const COMPOSITION_TYPE = 'type' // ok
const COMPOSITION_DATE = 'date' // ok
const COMPOSITION_ENCOUNTER = 'encounter' // on verra

const DEFAULT_CRITERIA_ERROR: SelectedCriteriaType = {
  id: 0,
  isInclusive: false,
  type: 'Patient',
  title: '',
  gender: [],
  vitalStatus: [],
  years: [0, 130],
  ageType: { id: 'year', label: 'En année' },
  label: undefined
}

const DEFAULT_GROUP_ERROR: CriteriaGroupType = {
  id: 0,
  title: '',
  type: 'andGroup',
  criteriaIds: []
}

type RequeteurCriteriaType = {
  // CRITERIA
  _type: string
  _id: number
  isInclusive: boolean
  resourceType:
    | typeof RESSOURCE_TYPE_PATIENT
    | typeof RESSOURCE_TYPE_ENCOUNTER
    | typeof RESSOURCE_TYPE_CLAIM
    | typeof RESSOURCE_TYPE_PROCEDURE
    | typeof RESSOURCE_TYPE_CONDITION
    | typeof RESSOURCE_TYPE_COMPOSITION
  filterFhir: string
  occurrence?: {
    n: number
    operator?: '<=' | '<' | '=' | '>=' | '>'
    timeDelayMin?: number
    timeDelayMax?: number
  }
}
type RequeteurGroupType =
  | {
      // GROUP (andGroup | orGroup)
      _type: 'andGroup' | 'orGroup'
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      temporalConstraints?: [] // NOT IMPLEMENTED
    }
  // NOT IMPLEMENTED
  | {
      // GROUP (nAmongM)
      _type: 'nAmongM'
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      nAmongMOptions: {
        n: number
        operator?: '<=' | '<' | '=' | '>=' | '>'
        timeDelayMin?: number
        timeDelayMax?: number
      }
      temporalConstraints?: [] // NOT IMPLEMENTED
    }

type RequeteurSearchType = {
  version: string
  _type: string
  sourcePopulation: {
    caresiteCohortList?: number[]
    providerCohorttList?: number[]
  }
  request: (RequeteurCriteriaType | RequeteurGroupType)[]
}

const constructFilterSolr = (criterion: SelectedCriteriaType) => {
  let filterFhir = ''

  const filterReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator
  const searchReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator

  switch (criterion.type) {
    case RESSOURCE_TYPE_PATIENT: {
      let ageFilter = ''
      if (criterion.years && criterion.years !== [0, 130]) {
        //@ts-ignore
        const date1 = moment()
          .subtract(criterion.years[1] + 1, criterion?.ageType?.id || 'years')
          .add(1, 'days')
          .format('YYYY-MM-DD')
        //@ts-ignore
        const date2 = moment()
          .subtract(criterion.years[0], criterion?.ageType?.id || 'years')
          .format('YYYY-MM-DD')
        ageFilter = `${PATIENT_BIRTHDATE}=ge${date1}&${PATIENT_BIRTHDATE}=le${date2}`
      }

      filterFhir = [
        `${
          criterion.gender && criterion.gender.length > 0
            ? `${PATIENT_GENDER}=${criterion.gender.map((gender: any) => gender.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.vitalStatus && criterion.vitalStatus.length > 0
            ? `${PATIENT_DECEASED}=${criterion.vitalStatus
                .map((vitalStatus: any) => vitalStatus.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${ageFilter ? `${ageFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_ENCOUNTER: {
      let lengthFilter = ''
      let multiplicator = 1
      if (criterion.durationType) {
        switch (criterion.durationType.id) {
          case 'month':
            multiplicator = 31
            break
          case 'year':
            multiplicator = 365
            break
          default:
            multiplicator = 1
            break
        }
      }

      if (criterion.duration && criterion.duration !== [0, 100]) {
        lengthFilter = `${ENCOUNTER_LENGTH}=ge${+criterion.duration[0] * multiplicator}&${ENCOUNTER_LENGTH}=le${
          +criterion.duration[1] * multiplicator
        }`
      }

      let ageFilter = ''
      if (criterion.years && criterion.years !== [0, 130]) {
        //@ts-ignore
        const date1 = moment()
          .subtract(+criterion.years[1], criterion?.ageType?.id || 'years')
          .format('YYYY-MM-DD')
        //@ts-ignore
        const date2 = moment()
          .subtract(+criterion.years[0], criterion?.ageType?.id || 'years')
          .format('YYYY-MM-DD')
        ageFilter = `${ENCOUNTER_BIRTHDATE}=ge${date1}&${ENCOUNTER_BIRTHDATE}=le${date2}`
      }

      filterFhir = [
        `${criterion.admissionMode ? `${ENCOUNTER_ADMISSIONMODE}=${criterion.admissionMode.id}` : ''}`,
        `${criterion.entryMode ? `${ENCOUNTER_ENTRYMODE}=${criterion.entryMode.id}` : ''}`,
        `${criterion.exitMode ? `${ENCOUNTER_EXITMODE}=${criterion.exitMode.id}` : ''}`,
        `${criterion.fileStatus ? `${ENCOUNTER_FILESTATUS}=${criterion.fileStatus.id}` : ''}`,
        `${lengthFilter ? `${lengthFilter}` : ''}`,
        `${ageFilter ? `${ageFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_COMPOSITION: {
      let dateFilter = ''

      if (criterion.startOccurrence || criterion.endOccurrence) {
        const dateFilter1 = criterion.startOccurrence
          ? `${COMPOSITION_DATE}=ge${moment(criterion.startOccurrence).format('YYYY-MM-DD')}`
          : ''
        const dateFilter2 = criterion.endOccurrence
          ? `${COMPOSITION_DATE}=le${moment(criterion.endOccurrence).format('YYYY-MM-DD')}`
          : ''
        dateFilter = dateFilter1 && dateFilter2 ? `${dateFilter1}&${dateFilter2}` : dateFilter1 + dateFilter2
      }

      filterFhir = [
        `${criterion.search ? `${COMPOSITION_TEXT}=${criterion.search}` : ''}`,
        `${
          criterion.docType && criterion.docType.length > 0
            ? `${COMPOSITION_TYPE}=${criterion.docType.map((docType: any) => docType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${criterion.encounter ? `${COMPOSITION_ENCOUNTER}=${criterion.encounter}` : ''}`,
        `${dateFilter ? `${dateFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_CONDITION: {
      let dateFilter = ''

      if (criterion.startOccurrence || criterion.endOccurrence) {
        const dateFilter1 = criterion.startOccurrence
          ? `${CONDITION_DATE}=ge${moment(criterion.startOccurrence).format('YYYY-MM-DD')}`
          : ''
        const dateFilter2 = criterion.endOccurrence
          ? `${CONDITION_DATE}=le${moment(criterion.endOccurrence).format('YYYY-MM-DD')}`
          : ''
        dateFilter = dateFilter1 && dateFilter2 ? `${dateFilter1}&${dateFilter2}` : dateFilter1 + dateFilter2
      }

      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? `${CONDITION_CODE}=${criterion.code.map((code: any) => code.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.diagnosticType && criterion.diagnosticType.length > 0
            ? `${CONDITION_TYPE}=${criterion.diagnosticType
                .map((diagnosticType: any) => diagnosticType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${criterion.encounter ? `${CONDITION_ENCOUNTER}=${criterion.encounter}` : ''}`,
        `${dateFilter ? `${dateFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_PROCEDURE: {
      let dateFilter = ''

      if (criterion.startOccurrence || criterion.endOccurrence) {
        const dateFilter1 = criterion.startOccurrence
          ? `${PROCEDURE_DATE}=ge${moment(criterion.startOccurrence).format('YYYY-MM-DD')}`
          : ''
        const dateFilter2 = criterion.endOccurrence
          ? `${PROCEDURE_DATE}=le${moment(criterion.endOccurrence).format('YYYY-MM-DD')}`
          : ''
        dateFilter = dateFilter1 && dateFilter2 ? `${dateFilter1}&${dateFilter2}` : dateFilter1 + dateFilter2
      }

      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? `${PROCEDURE_CODE}=${criterion.code
                .map((diagnosticType: any) => diagnosticType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${criterion.encounter ? `${PROCEDURE_ENCOUNTER}=${criterion.encounter}` : ''}`,
        `${dateFilter ? `${dateFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_CLAIM: {
      let dateFilter = ''
      if (criterion.startOccurrence || criterion.endOccurrence) {
        const dateFilter1 = criterion.startOccurrence
          ? `${CLAIM_DATE}=ge${moment(criterion.startOccurrence).format('YYYY-MM-DD')}`
          : ''
        const dateFilter2 = criterion.endOccurrence
          ? `${CLAIM_DATE}=le${moment(criterion.endOccurrence).format('YYYY-MM-DD')}`
          : ''
        dateFilter = dateFilter1 && dateFilter2 ? `${dateFilter1}&${dateFilter2}` : dateFilter1 + dateFilter2
      }

      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? `${CLAIM_CODE}=${criterion.code.map((diagnosticType: any) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${criterion.encounter ? `${CLAIM_ENCOUNTER}=${criterion.encounter}` : ''}`,
        `${dateFilter ? `${CLAIM_DATE}=${dateFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    default:
      break
  }

  return filterFhir
}

export function buildRequest(
  selectedPopulation: ScopeTreeRow[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroupType[]
) {
  if (!selectedPopulation) return ''

  const mainCriteriaGroups = criteriaGroup.filter(({ isSubGroup }) => !isSubGroup)

  const json: RequeteurSearchType = {
    version: 'v1.0',
    _type: 'request',
    sourcePopulation: {
      caresiteCohortList: selectedPopulation?.map(({ id }) => +id)
    },
    request: [
      {
        _type: 'andGroup',
        _id: 0,
        isInclusive: true,
        criteria: mainCriteriaGroups?.map((mainCriteriaGroup) => {
          const subItems: (RequeteurCriteriaType | RequeteurGroupType)[] = mainCriteriaGroup.criteriaIds
            ? mainCriteriaGroup.criteriaIds
                .map((itemId) => {
                  const isGroup = itemId < 0
                  if (!isGroup) {
                    const item: SelectedCriteriaType =
                      selectedCriteria.find(({ id }) => id === itemId) ?? DEFAULT_CRITERIA_ERROR

                    return {
                      _type: 'basicResource',
                      _id: item.id ?? 0,
                      resourceType: item.type ?? 'Patient',
                      isInclusive: item.isInclusive ?? true,
                      filterFhir: constructFilterSolr(item)
                    }
                  } else {
                    const group: CriteriaGroupType =
                      criteriaGroup.find(({ id }) => id === itemId) ?? DEFAULT_GROUP_ERROR

                    const subItems = group.criteriaIds
                      ? group.criteriaIds.map((criteriaId) => {
                          const subItem: SelectedCriteriaType =
                            selectedCriteria.find(({ id }) => id === criteriaId) ?? DEFAULT_CRITERIA_ERROR

                          return {
                            _type: 'basicResource',
                            _id: subItem.id ?? 0,
                            resourceType: subItem.type ?? 'Patient',
                            isInclusive: subItem.isInclusive ?? true,
                            filterFhir: constructFilterSolr(subItem)
                          }
                        })
                      : []

                    // DO SPECIAL THING FOR `NamongM`
                    return {
                      _type: group.type === 'NamongM' ? 'orGroup' : group.type,
                      _id: group.id,
                      isInclusive: group.isInclusive ?? true,
                      criteria: subItems
                    }
                  }
                })
                .filter((item) => item !== null)
            : []

          return {
            _id: mainCriteriaGroup.id,
            _type: 'andGroup',
            isInclusive: mainCriteriaGroup.isInclusive ?? true,
            criteria: subItems
          }
        })
      }
    ]
  }

  return JSON.stringify(json)
}

export async function unbuildRequest(_json: string) {
  let population: ScopeTreeRow[] | null = null
  let criteriaItems: RequeteurCriteriaType[] = []
  let criteriaGroup: RequeteurGroupType[] = []

  const json = JSON.parse(_json)
  const {
    sourcePopulation: { caresiteCohortList },
    request
  } = json

  /**
   * Retrieve popultion
   */
  for (const caresiteCohortItem of caresiteCohortList) {
    const newPopulation = await fetchPopulation(caresiteCohortItem ?? '')
    population = population ? [...population, ...newPopulation] : newPopulation
  }

  /**
   *
   * @param currentItem
   */
  const exploreRequest = (currentItem: any) => {
    const { criteria } = currentItem

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criteriaItems = [...criteriaItems, criterion]
      } else {
        criteriaGroup = [...criteriaGroup, { ...criterion, isSubItem: true }]
        if (criterion && criterion.criteria && criterion.criteria.length > 0) {
          exploreRequest(criterion)
        }
      }
    }
  }
  for (const criterion of request[0].criteria) {
    // console.log('exploredRequest - MAIN GROUP', criterion)
    criteriaGroup = [...criteriaGroup, criterion]
    exploreRequest(criterion)
  }

  const _retrieveInformationFromJson = async (element: RequeteurCriteriaType) => {
    const currentCriterion: any = {
      id: element._id,
      type: element.resourceType,
      isInclusive: element.isInclusive,
      title: ''
    }

    switch (element.resourceType) {
      case RESSOURCE_TYPE_PATIENT: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            if (key === '_list') {
              population = await fetchPopulation(value ?? '')
              return
            } else {
              currentCriterion.title = 'Critère démographique'
              currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : null
              currentCriterion.years = currentCriterion.years ? currentCriterion.years : null
              currentCriterion.gender = currentCriterion.gender ? currentCriterion.gender : []
              currentCriterion.vitalStatus = currentCriterion.vitalStatus ? currentCriterion.vitalStatus : []
              switch (key) {
                case PATIENT_BIRTHDATE: {
                  currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : null
                  currentCriterion.years = currentCriterion.years ? currentCriterion.years : [0, 130]
                  const ageType = [
                    { id: 'year', label: 'années' },
                    { id: 'month', label: 'mois' },
                    { id: 'day', label: 'jours' }
                  ]

                  if (value?.search('ge') === 0) {
                    const date = value?.replace('ge', '') ? moment(value?.replace('ge', ''), 'YYYY-MM-DD') : null
                    const diff = date ? moment().diff(date, 'days') : 0

                    let currentAgeType: 'year' | 'month' | 'day' = 'year'
                    if (diff >= 130 && diff <= 3000) {
                      currentAgeType = 'month'
                    } else if (diff <= 130) {
                      currentAgeType = 'day'
                    }

                    const foundAgeType = ageType.find(({ id }) => id === currentAgeType)
                    currentCriterion.ageType = foundAgeType
                    if (date) currentCriterion.years[1] = moment().diff(date, currentAgeType) || 130
                  } else if (value?.search('le') === 0) {
                    const date = value?.replace('le', '') ? moment(value?.replace('le', ''), 'YYYY-MM-DD') : null
                    const diff = date ? moment().diff(date, 'days') : 0

                    let currentAgeType: 'year' | 'month' | 'day' = 'year'
                    if (currentCriterion.ageType) {
                      currentAgeType = currentCriterion.ageType.id
                    } else {
                      if (diff >= 130 && diff <= 3000) {
                        currentAgeType = 'month'
                      } else if (diff <= 130) {
                        currentAgeType = 'day'
                      }
                      const foundAgeType = ageType.find(({ id }) => id === currentAgeType)
                      currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : foundAgeType
                    }
                    currentCriterion.years[0] = moment().diff(date, currentAgeType) || 0
                  }
                  break
                }
                case PATIENT_GENDER: {
                  const genderIds = value?.split(',')
                  const newGenderIds = genderIds?.map((docTypeId: any) => ({ id: docTypeId }))
                  if (!newGenderIds) continue

                  currentCriterion.gender = currentCriterion.gender
                    ? [...currentCriterion.gender, ...newGenderIds]
                    : newGenderIds
                  break
                }
                case PATIENT_DECEASED: {
                  const vitalStatusIds = value?.split(',')

                  // Warning with `id: vitalStatusId === 'true'` ....
                  const newVitalStatusIds = vitalStatusIds?.map((vitalStatusId: any) => ({
                    id: vitalStatusId === 'true'
                  }))
                  if (!newVitalStatusIds) continue

                  currentCriterion.vitalStatus = currentCriterion.vitalStatus
                    ? [...currentCriterion.vitalStatus, ...newVitalStatusIds]
                    : newVitalStatusIds
                  break
                }
                default:
                  break
              }
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_ENCOUNTER: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de prise en charge'
          currentCriterion.duration = currentCriterion.duration ? currentCriterion.duration : null
          currentCriterion.admissionMode = currentCriterion.admissionMode ? currentCriterion.admissionMode : []
          currentCriterion.entryMode = currentCriterion.entryMode ? currentCriterion.entryMode : []
          currentCriterion.exitMode = currentCriterion.exitMode ? currentCriterion.exitMode : []
          currentCriterion.fileStatus = currentCriterion.fileStatus ? currentCriterion.fileStatus : []

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case ENCOUNTER_LENGTH: {
                const ageType = [
                  { id: 'year', label: 'années' },
                  { id: 'month', label: 'mois' },
                  { id: 'day', label: 'jours' }
                ]

                currentCriterion.duration = currentCriterion.duration ? currentCriterion.duration : [0, 130]
                if (value?.search('ge') === 0) {
                  currentCriterion.duration[0] = +value?.replace('ge', '') || 0
                } else if (value?.search('le') === 0) {
                  currentCriterion.duration[1] = +value?.replace('le', '') || 130
                }

                if (currentCriterion.duration[1] % 31 === 0) {
                  currentCriterion.durationType = ageType[1]
                  currentCriterion.duration[0] = currentCriterion.duration[0] / 31
                  currentCriterion.duration[1] = currentCriterion.duration[1] / 31
                } else if (currentCriterion.duration[1] % 365 === 0) {
                  currentCriterion.durationType = ageType[0]
                  currentCriterion.duration[0] = currentCriterion.duration[0] / 365
                  currentCriterion.duration[1] = currentCriterion.duration[1] / 365
                } else {
                  currentCriterion.durationType = ageType[2]
                }
                break
              }
              case ENCOUNTER_BIRTHDATE: {
                currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : null
                currentCriterion.years = currentCriterion.years ? currentCriterion.years : [0, 130]
                const ageType = [
                  { id: 'year', label: 'années' },
                  { id: 'month', label: 'mois' },
                  { id: 'day', label: 'jours' }
                ]

                if (value?.search('ge') === 0) {
                  const date = value?.replace('ge', '') ? moment(value?.replace('ge', ''), 'YYYY-MM-DD') : null
                  const diff = date ? moment().diff(date, 'days') : 0

                  let currentAgeType: 'year' | 'month' | 'day' = 'year'
                  if (diff >= 130 && diff <= 3000) {
                    currentAgeType = 'month'
                  } else if (diff <= 130) {
                    currentAgeType = 'day'
                  }

                  const foundAgeType = ageType.find(({ id }) => id === currentAgeType)
                  currentCriterion.ageType = foundAgeType
                  if (date) currentCriterion.years[1] = moment().diff(date, currentAgeType) || 130
                } else if (value?.search('le') === 0) {
                  const date = value?.replace('le', '') ? moment(value?.replace('le', ''), 'YYYY-MM-DD') : null
                  const diff = date ? moment().diff(date, 'days') : 0

                  let currentAgeType: 'year' | 'month' | 'day' = 'year'
                  if (currentCriterion.ageType) {
                    currentAgeType = currentCriterion.ageType.id
                  } else {
                    if (diff >= 130 && diff <= 3000) {
                      currentAgeType = 'month'
                    } else if (diff <= 130) {
                      currentAgeType = 'day'
                    }
                    const foundAgeType = ageType.find(({ id }) => id === currentAgeType)
                    currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : foundAgeType
                  }
                  currentCriterion.years[0] = moment().diff(date, currentAgeType) || 0
                }
                break
              }
              case ENCOUNTER_ADMISSIONMODE:
                currentCriterion.admissionMode = { id: value }
                break
              case ENCOUNTER_ENTRYMODE:
                currentCriterion.entryMode = { id: value }
                break
              case ENCOUNTER_EXITMODE:
                currentCriterion.exitMode = { id: value }
                break
              case ENCOUNTER_FILESTATUS:
                currentCriterion.fileStatus = { id: value }
                break

              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_COMPOSITION: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de document'
          currentCriterion.search = currentCriterion.search ? currentCriterion.search : null
          currentCriterion.docType = currentCriterion.docType ? currentCriterion.docType : []
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case COMPOSITION_TEXT:
                currentCriterion.search = value
                break
              case COMPOSITION_TYPE: {
                const docTypeIds = value?.split(',')
                const newDocTypeIds = docTypeIds?.map((docTypeId: any) => ({ id: docTypeId }))
                if (!newDocTypeIds) continue

                currentCriterion.docType = currentCriterion.docType
                  ? [...currentCriterion.docType, ...newDocTypeIds]
                  : newDocTypeIds
                break
              }
              case COMPOSITION_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case COMPOSITION_DATE: {
                if (value?.search('ge') === 0) {
                  currentCriterion.startOccurrence = value?.replace('ge', '')
                } else if (value?.search('le') === 0) {
                  currentCriterion.endOccurrence = value?.replace('le', '')
                }
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CONDITION: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de diagnostic'
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
          currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CONDITION_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case CONDITION_TYPE: {
                const diagnosticTypeIds = value?.split(',')
                const newDiagnosticType = diagnosticTypeIds?.map((diagnosticTypeId: any) => ({ id: diagnosticTypeId }))
                if (!newDiagnosticType) continue

                currentCriterion.diagnosticType = currentCriterion.diagnosticType
                  ? [...currentCriterion.diagnosticType, ...newDiagnosticType]
                  : newDiagnosticType
                break
              }
              case CONDITION_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case CONDITION_DATE: {
                if (value?.search('ge') === 0) {
                  currentCriterion.startOccurrence = value?.replace('ge', '')
                } else if (value?.search('le') === 0) {
                  currentCriterion.endOccurrence = value?.replace('le', '')
                }
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_PROCEDURE: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = "Critères d'actes CCAM"
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
          currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case PROCEDURE_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case PROCEDURE_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case PROCEDURE_DATE: {
                if (value?.search('ge') === 0) {
                  currentCriterion.startOccurrence = value?.replace('ge', '')
                } else if (value?.search('le') === 0) {
                  currentCriterion.endOccurrence = value?.replace('le', '')
                }
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CLAIM: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de GHM'
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CLAIM_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case CLAIM_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case CLAIM_DATE: {
                if (value?.search('ge') === 0) {
                  currentCriterion.startOccurrence = value?.replace('ge', '')
                } else if (value?.search('le') === 0) {
                  currentCriterion.endOccurrence = value?.replace('le', '')
                }
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      default:
        break
    }
    return currentCriterion
  }

  const convertJsonObjectsToCriteria = async (
    _criteriaItems: RequeteurCriteriaType[]
  ): Promise<SelectedCriteriaType[]> => {
    let newSelectedCriteriaItems: SelectedCriteriaType[] = []

    for (const criteriaItem of _criteriaItems) {
      newSelectedCriteriaItems = [...newSelectedCriteriaItems, await _retrieveInformationFromJson(criteriaItem)]
    }

    return newSelectedCriteriaItems
  }

  const convertJsonObjectsToCriteriaGroup: (_criteriaGroup: RequeteurGroupType[]) => CriteriaGroupType[] = (
    _criteriaGroup
  ) => {
    return _criteriaGroup.map((groupItem: any) => ({
      id: groupItem._id,
      title: 'Groupe de critère',
      criteriaIds:
        groupItem.criteria && groupItem.criteria.length > 0
          ? groupItem.criteria.map((criteria: RequeteurCriteriaType | RequeteurGroupType) => criteria._id)
          : [],
      isSubGroup: groupItem.isSubItem,
      isInclusive: groupItem.isInclusive,
      type: groupItem.type
    }))
  }

  return {
    population,
    criteria: await convertJsonObjectsToCriteria(criteriaItems),
    criteriaGroup: convertJsonObjectsToCriteriaGroup(criteriaGroup)
  }
}

export const getDataFromFetch = async (_criteria: any, selectedCriteria: SelectedCriteriaType[]) => {
  for (const _criterion of _criteria) {
    if (_criterion.fetch) {
      if (!_criterion.data) _criterion.data = {}
      const fetchKeys = Object.keys(_criterion.fetch)
      for (const fetchKey of fetchKeys) {
        const dataKey = fetchKey.replace('fetch', '').replace(/(\b[A-Z])(?![A-Z])/g, ($1) => $1.toLowerCase())
        switch (dataKey) {
          case 'ghmData':
          case 'ccamData':
          case 'cim10Diagnostic': {
            if (_criterion.data[dataKey] === 'loading') _criterion.data[dataKey] = []
            const currentSelectedCriteria = selectedCriteria.filter(
              (criterion: SelectedCriteriaType) => criterion.type === _criterion.id
            )

            if (currentSelectedCriteria) {
              for (const currentcriterion of currentSelectedCriteria) {
                if (
                  currentcriterion &&
                  !(
                    currentcriterion.type === 'Patient' ||
                    currentcriterion.type === 'Composition' ||
                    currentcriterion.type === 'Encounter'
                  ) &&
                  currentcriterion.code &&
                  currentcriterion.code.length > 0
                ) {
                  for (const code of currentcriterion.code) {
                    const allreadyHere = _criterion.data[dataKey]
                      ? _criterion.data[dataKey].find((data: any) => data.id === code?.id)
                      : undefined

                    if (!allreadyHere) {
                      _criterion.data[dataKey] = [
                        ..._criterion.data[dataKey],
                        ...(await _criterion.fetch[fetchKey](code?.id))
                      ]
                    }
                  }
                }
              }
            }
            break
          }
          default:
            if (_criterion.data[dataKey] === 'loading') {
              _criterion.data[dataKey] = await _criterion.fetch[fetchKey]()
            }
            break
        }
      }
    }
    _criterion.subItems =
      _criterion.subItems && _criterion.subItems.length > 0
        ? await getDataFromFetch(_criterion.subItems, selectedCriteria)
        : []
  }
  return _criteria
}
