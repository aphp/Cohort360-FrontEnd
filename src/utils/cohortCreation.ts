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
  gender: null,
  vitalStatus: null,
  years: [0, 130]
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
  filterSolr: string
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
  sourcePopulation: {
    caresiteCohortList?: number[]
    providerCohorttList?: number[]
  }
  request: (RequeteurCriteriaType | RequeteurGroupType)[]
}

const constructFilterSolr = (criterion: SelectedCriteriaType) => {
  let fhirFilter = ''

  const filterReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator
  const searchReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator

  switch (criterion.type) {
    case RESSOURCE_TYPE_PATIENT: {
      let ageFilter = ''
      if (criterion.years && criterion.years !== [0, 130]) {
        const date1 = moment()
          .subtract(criterion.years[1] + 1, 'years')
          .add(1, 'days')
          .format('YYYY-MM-DD')
        const date2 = moment().subtract(criterion.years[0], 'years').format('YYYY-MM-DD')
        ageFilter = `${PATIENT_BIRTHDATE}=ge${date1}&${PATIENT_BIRTHDATE}=le${date2}`
      }

      fhirFilter = [
        `${criterion.gender ? `${PATIENT_GENDER}=${criterion.gender.id}` : ''}`,
        `${criterion.vitalStatus ? `${PATIENT_DECEASED}=${criterion.vitalStatus.id}` : ''}`,
        `${ageFilter ? `${ageFilter}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_ENCOUNTER: {
      let lengthFilter = ''
      if (criterion.duration && criterion.duration !== [0, 100]) {
        lengthFilter = `${ENCOUNTER_LENGTH}=ge${criterion.duration[0]}&${ENCOUNTER_LENGTH}=le${criterion.duration[1]}`
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

      fhirFilter = [
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

      fhirFilter = [
        `${criterion.search ? `${COMPOSITION_TEXT}=${criterion.search}` : ''}`,
        `${criterion.docType ? `${COMPOSITION_TYPE}=${criterion.docType.id}` : ''}`,
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

      fhirFilter = [
        `${criterion.code ? `${CONDITION_CODE}=${criterion.code.map(({ id }) => id).reduce(searchReducer)}` : ''}`,
        `${criterion.diagnosticType ? `${CONDITION_TYPE}=${criterion.diagnosticType.id}` : ''}`,
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

      fhirFilter = [
        `${criterion.code ? `${PROCEDURE_CODE}=${criterion.code.map(({ id }) => id).reduce(searchReducer)}` : ''}`,
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

      fhirFilter = [
        `${criterion.code ? `${CLAIM_CODE}=${criterion.code.map(({ id }) => id).reduce(searchReducer)}` : ''}`,
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

  return fhirFilter
}

export function buildRequest(
  selectedPopulation: ScopeTreeRow[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroupType[]
) {
  if (!selectedPopulation) return ''

  const mainCriteriaGroups = criteriaGroup.filter(({ isSubGroup }) => !isSubGroup)

  const json: RequeteurSearchType = {
    version: '1.0',
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
                      filterSolr: constructFilterSolr(item)
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
                            filterSolr: constructFilterSolr(subItem)
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
  let criteriaItems: SelectedCriteriaType[] = []
  let criteriaGroup: CriteriaGroupType[] = []

  const json = JSON.parse(_json)
  const {
    sourcePopulation: { caresiteCohortList },
    request
  } = json

  for (const caresiteCohortItem of caresiteCohortList) {
    const newPopulation = await fetchPopulation(caresiteCohortItem ?? '')
    population = population ? [...population, ...newPopulation] : newPopulation
  }

  const exploreRequest = (currentItem: any) => {
    const { criteria } = currentItem

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criteriaItems = [...criteriaItems, criterion]
      } else {
        criteriaGroup = [...criteriaGroup, { ...criterion, isSubItem: true }]

        if (criterion && criterion.criteria) {
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

  return {
    population,
    criteria: criteriaItems,
    criteriaGroup
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
              (selectedCriterion: SelectedCriteriaType) => selectedCriterion.type === _criterion.id
            )

            if (currentSelectedCriteria) {
              for (const currentSelectedCriterion of currentSelectedCriteria) {
                if (
                  currentSelectedCriterion &&
                  !(
                    currentSelectedCriterion.type === 'Patient' ||
                    currentSelectedCriterion.type === 'Composition' ||
                    currentSelectedCriterion.type === 'Encounter'
                  ) &&
                  currentSelectedCriterion.code &&
                  currentSelectedCriterion.code.length > 0
                ) {
                  for (const code of currentSelectedCriterion.code) {
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
