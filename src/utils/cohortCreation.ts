import moment from 'moment'

import services from 'services'
import { ScopeTreeRow, SelectedCriteriaType, CriteriaGroupType, TemporalConstraintsType, DocType } from 'types'

import { docTypes } from 'assets/docTypes.json'

const REQUETEUR_VERSION = 'v1.2.1'

// TODO: à changer quand ticket fhir ok vvvvv
const RESSOURCE_TYPE_IPP_LIST: 'IPPList' = 'IPPList'
const IPP_LIST_FHIR = 'identifier-simple'

const RESSOURCE_TYPE_PATIENT: 'Patient' = 'Patient'
const PATIENT_GENDER = 'gender' // ok
const PATIENT_BIRTHDATE = 'age-day' // ok
const PATIENT_DECEASED = 'deceased' // ok

const RESSOURCE_TYPE_ENCOUNTER: 'Encounter' = 'Encounter'
const ENCOUNTER_LENGTH = 'length' // ok
const ENCOUNTER_MIN_BIRTHDATE = 'start-age-visit' // ok
const ENCOUNTER_MAX_BIRTHDATE = 'end-age-visit' // ok
const ENCOUNTER_ENTRYMODE = 'admitted-from' // ok
const ENCOUNTER_EXITMODE = 'discharge' // ok
const ENCOUNTER_PRISENCHARGETYPE = 'class' // ok
const ENCOUNTER_TYPEDESEJOUR = 'stay' // ok
const ENCOUNTER_FILESTATUS = 'status' // ok
const ENCOUNTER_ADMISSIONMODE = 'reason' // ok
const ENCOUNTER_REASON = 'discharge-type' // ok
const ENCOUNTER_DESTINATION = 'destination' // ok
const ENCOUNTER_PROVENANCE = 'provenance' // ok
const ENCOUNTER_ADMISSION = 'reason-code' // ok

const RESSOURCE_TYPE_CLAIM: 'Claim' = 'Claim'
const CLAIM_CODE = 'codeList' // ok
const CLAIM_CODE_ALL_HIERARCHY = 'code'

const RESSOURCE_TYPE_PROCEDURE: 'Procedure' = 'Procedure'
const PROCEDURE_CODE = 'codeList' // ok
const PROCEDURE_CODE_ALL_HIERARCHY = 'code'

const RESSOURCE_TYPE_CONDITION: 'Condition' = 'Condition' // ok
const CONDITION_CODE = 'codeList' // ok
const CONDITION_CODE_ALL_HIERARCHY = 'code'
const CONDITION_TYPE = 'type' // ok

const RESSOURCE_TYPE_COMPOSITION: 'Composition' = 'Composition'
const COMPOSITION_TEXT = '_text' // ok
const COMPOSITION_TYPE = 'type' // ok

const RESSOURCE_TYPE_MEDICATION_REQUEST: 'MedicationRequest' = 'MedicationRequest' // = Prescription
const RESSOURCE_TYPE_MEDICATION_ADMINISTRATION: 'MedicationAdministration' = 'MedicationAdministration' // = Administration
const MEDICATION_CODE = 'hierarchy-ATC' // ok
const MEDICATION_CODE_ALL_HIERARCHY = 'medication-simple'
// const MEDICATION_UCD = 'code_id' // ok
const MEDICATION_PRESCRIPTION_TYPE = 'type' // ok
const MEDICATION_ADMINISTRATION = 'route' // ok

const RESSOURCE_TYPE_OBSERVATION: 'Observation' = 'Observation'
const OBSERVATION_CODE = 'part-of'
const OBSERVATION_CODE_ALL_HIERARCHY = 'code'
const OBSERVATION_VALUE = 'value-quantity-value'

const DEFAULT_CRITERIA_ERROR: SelectedCriteriaType = {
  id: 0,
  isInclusive: false,
  type: 'Patient',
  title: '',
  gender: [],
  vitalStatus: [],
  years: [0, 130],
  ageType: { id: 'year', label: 'En année' }
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
    | typeof RESSOURCE_TYPE_MEDICATION_REQUEST
    | typeof RESSOURCE_TYPE_MEDICATION_ADMINISTRATION
    | typeof RESSOURCE_TYPE_OBSERVATION
    | typeof RESSOURCE_TYPE_IPP_LIST
  filterFhir: string
  occurrence?: {
    n: number
    operator?: '<=' | '<' | '=' | '>' | '>='
    timeDelayMin?: number
    timeDelayMax?: number
  }
  dateRangeList?: {
    minDate?: string // YYYY-MM-DD
    maxDate?: string // YYYY-MM-DD
    datePreference?: 'event_date' | 'encounter_end-date' | 'encounter_start-date'
    dateIsNotNull?: boolean
  }[]
  encounterDateRange?: {
    minDate?: string // YYYY-MM-DD
    maxDate?: string // YYYY-MM-DD
    dateIsNotNull?: boolean
  }
}

type RequeteurGroupType =
  | {
      // GROUP (andGroup | orGroup)
      _type: 'andGroup' | 'orGroup'
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      temporalConstraints?: TemporalConstraintsType[] // NOT IMPLEMENTED
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
      temporalConstraints?: TemporalConstraintsType[] // NOT IMPLEMENTED
    }

type RequeteurSearchType = {
  version: string
  _type: string
  sourcePopulation: {
    caresiteCohortList?: number[]
    providerCohorttList?: number[]
  }
  request: RequeteurGroupType | undefined
}

const constructFilterFhir = (criterion: SelectedCriteriaType) => {
  let filterFhir = ''

  const filterReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator
  const searchReducer = (accumulator: any, currentValue: any) =>
    accumulator || accumulator === false ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator

  switch (criterion.type) {
    case RESSOURCE_TYPE_PATIENT: {
      let ageFilter = ''
      if (criterion.years && (criterion.years[0] !== 0 || criterion.years[1] !== 130)) {
        const today = moment()
        //@ts-ignore
        const date1 = moment()
          .subtract(criterion.years[1] + 1, criterion?.ageType?.id || 'years')
          .add(1, 'days')
        //@ts-ignore
        const date2 = moment().subtract(criterion.years[0], criterion?.ageType?.id || 'years')

        ageFilter =
          `${PATIENT_BIRTHDATE}=` +
          `le${today.diff(date1, 'day')}` +
          `&${PATIENT_BIRTHDATE}=` +
          `ge${today.diff(date2, 'day')}`
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
      let ageFilter = ''
      if (criterion.durationType) {
        let multiplicator = 1
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

        if (criterion.duration && (criterion.duration[0] !== 0 || criterion.duration[1] !== 100)) {
          lengthFilter = `${ENCOUNTER_LENGTH}=ge${+criterion.duration[0] * multiplicator}&${ENCOUNTER_LENGTH}=le${
            +criterion.duration[1] * multiplicator
          }`
        }
      }

      if (criterion.ageType) {
        let multiplicator = 1
        switch (criterion.ageType.id) {
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

        if (criterion.years && (criterion.years[0] !== 0 || criterion.years[1] !== 100)) {
          ageFilter = `${ENCOUNTER_MIN_BIRTHDATE}=ge${
            +criterion.years[0] * multiplicator
          }&${ENCOUNTER_MAX_BIRTHDATE}=le${+criterion.years[1] * multiplicator}`
        }
      }

      // Ignore TypeScript because we need to check if array is not empty
      // @ts-ignore
      filterFhir = [
        `${
          criterion.admissionMode && criterion.admissionMode.length > 0
            ? `${ENCOUNTER_ADMISSIONMODE}=${criterion.admissionMode
                .map((admissionMode: any) => admissionMode.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.entryMode && criterion.entryMode.length > 0
            ? `${ENCOUNTER_ENTRYMODE}=${criterion.entryMode
                .map((entryMode: any) => entryMode.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.exitMode && criterion.exitMode.length > 0
            ? `${ENCOUNTER_EXITMODE}=${criterion.exitMode.map((exitMode: any) => exitMode.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.priseEnChargeType && criterion.priseEnChargeType.length > 0
            ? `${ENCOUNTER_PRISENCHARGETYPE}=${criterion.priseEnChargeType
                .map((priseEnChargeType: any) => priseEnChargeType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.typeDeSejour && criterion.typeDeSejour.length > 0
            ? `${ENCOUNTER_TYPEDESEJOUR}=${criterion.typeDeSejour
                .map((typeDeSejour: any) => typeDeSejour.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.fileStatus && criterion.fileStatus.length > 0
            ? `${ENCOUNTER_FILESTATUS}=${criterion.fileStatus
                .map((fileStatus: any) => fileStatus.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.reason && criterion.reason.length > 0
            ? `${ENCOUNTER_REASON}=${criterion.reason.map((reason: any) => reason.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.destination && criterion.destination.length > 0
            ? `${ENCOUNTER_DESTINATION}=${criterion.destination
                .map((destination: any) => destination.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.provenance && criterion.provenance.length > 0
            ? `${ENCOUNTER_PROVENANCE}=${criterion.provenance
                .map((provenance: any) => provenance.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.admission && criterion.admission.length > 0
            ? `${ENCOUNTER_ADMISSION}=${criterion.admission
                .map((admission: any) => admission.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${lengthFilter ? `${lengthFilter}` : ''}`,
        `${ageFilter ? `${ageFilter}` : ''}`
      ].filter((elem) => elem)

      if (filterFhir && filterFhir.length > 0) {
        // Ignore TypeScript because we need to check if array is not empty
        // @ts-ignore
        filterFhir = filterFhir.reduce(filterReducer)
      } else {
        filterFhir = ''
      }
      break
    }

    case RESSOURCE_TYPE_COMPOSITION: {
      filterFhir = [
        `status=final&type:not=doc-impor&empty=false`,
        `${criterion.search ? `${COMPOSITION_TEXT}=${encodeURIComponent(criterion.search)}` : ''}`,
        `${
          criterion.docType && criterion.docType.length > 0
            ? `${COMPOSITION_TYPE}=${criterion.docType.map((docType: DocType) => docType.code).reduce(searchReducer)}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_CONDITION: {
      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CONDITION_CODE_ALL_HIERARCHY}=*`
              : `${CONDITION_CODE}=${criterion.code.map((code: any) => code.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.diagnosticType && criterion.diagnosticType.length > 0
            ? `${CONDITION_TYPE}=${criterion.diagnosticType
                .map((diagnosticType: any) => diagnosticType.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_PROCEDURE: {
      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${PROCEDURE_CODE_ALL_HIERARCHY}=*`
              : `${PROCEDURE_CODE}=${criterion.code
                  .map((diagnosticType: any) => diagnosticType.id)
                  .reduce(searchReducer)}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_CLAIM: {
      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CLAIM_CODE_ALL_HIERARCHY}=*`
              : `${CLAIM_CODE}=${criterion.code.map((diagnosticType: any) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_MEDICATION_REQUEST:
    case RESSOURCE_TYPE_MEDICATION_ADMINISTRATION: {
      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${MEDICATION_CODE_ALL_HIERARCHY}=*`
              : `${MEDICATION_CODE}=${criterion.code
                  .map((diagnosticType: any) => diagnosticType.id)
                  .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.type === RESSOURCE_TYPE_MEDICATION_REQUEST &&
          criterion.prescriptionType &&
          criterion.prescriptionType.length > 0
            ? `${MEDICATION_PRESCRIPTION_TYPE}=${criterion.prescriptionType
                .map((prescriptionType: any) => prescriptionType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.administration && criterion.administration.length > 0
            ? `${MEDICATION_ADMINISTRATION}=${criterion.administration
                .map((administration: any) => administration.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_OBSERVATION: {
      let valueComparatorFilter = ''
      if (criterion.valueComparator) {
        switch (criterion.valueComparator) {
          case '<':
            valueComparatorFilter = 'lt'
            break
          case '<=':
            valueComparatorFilter = 'le'
            break
          case '=':
            valueComparatorFilter = ''
            break
          case '>':
            valueComparatorFilter = 'gt'
            break
          case '>=':
            valueComparatorFilter = 'ge'
            break
          default:
            valueComparatorFilter = ''
            break
        }
      }

      filterFhir = [
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${OBSERVATION_CODE_ALL_HIERARCHY}=*`
              : `${OBSERVATION_CODE}=${criterion.code
                  .map((diagnosticType: any) => diagnosticType.id)
                  .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.isLeaf &&
          criterion.code &&
          criterion.code.length === 1 &&
          criterion.valueComparator &&
          (criterion.valueMin || criterion.valueMax)
            ? criterion.valueComparator === '<x>' && criterion.valueMax
              ? `${OBSERVATION_VALUE}=le${criterion.valueMin}&${OBSERVATION_VALUE}=ge${criterion.valueMax}`
              : `${OBSERVATION_VALUE}=${valueComparatorFilter}${criterion.valueMin}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_IPP_LIST: {
      filterFhir = [`${criterion.search ? `${IPP_LIST_FHIR}=${criterion.search}` : ''}`]
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
  selectedPopulation: (ScopeTreeRow | undefined)[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroupType[],
  temporalConstraints: TemporalConstraintsType[]
) {
  if (!selectedPopulation) return ''
  selectedPopulation = selectedPopulation.filter((elem) => elem !== undefined)

  const exploreCriteriaGroup = (itemIds: number[]) => {
    let children: (RequeteurCriteriaType | RequeteurGroupType)[] = []

    for (const itemId of itemIds) {
      let child: RequeteurCriteriaType | RequeteurGroupType | null = null
      const isGroup = itemId < 0
      if (!isGroup) {
        // return RequeteurCriteriaType
        const item: SelectedCriteriaType = selectedCriteria.find(({ id }) => id === itemId) ?? DEFAULT_CRITERIA_ERROR

        child = {
          _type: 'basicResource',
          _id: item.id ?? 0,
          isInclusive: item.isInclusive ?? true,
          resourceType: item.type ?? RESSOURCE_TYPE_PATIENT,
          filterFhir: constructFilterFhir(item),
          occurrence:
            !(
              item.type === RESSOURCE_TYPE_PATIENT ||
              item.type === RESSOURCE_TYPE_ENCOUNTER ||
              item.type === RESSOURCE_TYPE_IPP_LIST
            ) && item.occurrence
              ? {
                  n: item.occurrence,
                  operator: item?.occurrenceComparator
                }
              : undefined,
          dateRangeList:
            !(
              item.type === RESSOURCE_TYPE_PATIENT ||
              item.type === RESSOURCE_TYPE_ENCOUNTER ||
              item.type === RESSOURCE_TYPE_IPP_LIST
            ) &&
            (item.startOccurrence || item.endOccurrence)
              ? [
                  {
                    minDate: item.startOccurrence
                      ? moment(item.startOccurrence).format('YYYY-MM-DD[T00:00:00Z]')
                      : undefined,
                    maxDate: item.endOccurrence
                      ? moment(item.endOccurrence).format('YYYY-MM-DD[T00:00:00Z]')
                      : undefined
                  }
                ]
              : undefined,
          encounterDateRange:
            !(item.type === RESSOURCE_TYPE_PATIENT || item.type === RESSOURCE_TYPE_IPP_LIST) &&
            (item.encounterStartDate || item.encounterEndDate)
              ? {
                  minDate: item.encounterStartDate
                    ? moment(item.encounterStartDate).format('YYYY-MM-DD[T00:00:00Z]')
                    : undefined,
                  maxDate: item.encounterEndDate
                    ? moment(item.encounterEndDate).format('YYYY-MM-DD[T00:00:00Z]')
                    : undefined
                }
              : undefined
        }
      } else {
        // return RequeteurGroupType
        const group: CriteriaGroupType = criteriaGroup.find(({ id }) => id === itemId) ?? DEFAULT_GROUP_ERROR

        // DO SPECIAL THING FOR `NamongM`
        if (group.type === 'NamongM') {
          child = {
            _type: 'nAmongM',
            _id: group.id,
            isInclusive: group.isInclusive ?? true,
            criteria: exploreCriteriaGroup(group.criteriaIds),
            nAmongMOptions: {
              n: group.options.number,
              operator: group.options.operator
            }
          }
        } else {
          child = {
            _type: group.type,
            _id: group.id,
            isInclusive: group.isInclusive ?? true,
            criteria: exploreCriteriaGroup(group.criteriaIds)
          }
        }
      }
      children = [...children, child]
    }
    return children
  }

  const mainCriteriaGroups = criteriaGroup.find(({ id }) => id === 0)

  const json: RequeteurSearchType = {
    version: REQUETEUR_VERSION,
    _type: 'request',
    sourcePopulation: {
      caresiteCohortList: selectedPopulation
        ?.map((_selectedPopulation: any) =>
          _selectedPopulation.extension
            ? (
                _selectedPopulation.extension.find((extension: any) => extension.url === 'cohort-id') ?? {
                  valueInteger: null
                }
              ).valueInteger
            : null
        )
        .filter((item) => !!item && item !== 'loading')
    },
    request: !mainCriteriaGroups
      ? undefined
      : {
          _id: 0,
          _type: mainCriteriaGroups.type === 'orGroup' ? 'orGroup' : 'andGroup',
          isInclusive: !!mainCriteriaGroups.isInclusive,
          criteria: exploreCriteriaGroup(mainCriteriaGroups.criteriaIds),
          temporalConstraints: temporalConstraints.filter(({ constraintType }) => constraintType !== 'none')
        }
  }

  return JSON.stringify(json)
}

export async function unbuildRequest(_json: string) {
  let population: (ScopeTreeRow | undefined)[] | null = null
  let criteriaItems: RequeteurCriteriaType[] = []
  let criteriaGroup: RequeteurGroupType[] = []

  if (!_json) {
    return {
      population: null,
      criteria: [],
      criteriaGroup: []
    }
  }

  const json = JSON.parse(_json)
  const {
    sourcePopulation: { caresiteCohortList },
    request
  } = json

  /**
   * Retrieve population
   */
  if (typeof services.perimeters.fetchPerimeterInfoForRequeteur !== 'function') {
    return {
      population: null,
      criteria: [],
      criteriaGroup: []
    }
  }

  for (const caresiteCohortItem of caresiteCohortList) {
    const newPopulation = await services.perimeters.fetchPerimeterInfoForRequeteur(caresiteCohortItem ?? '')
    // Don't do that, do not filter population, if you have a pop. with an undefined,
    // you got a modal with the posibility to change your current source pop.
    // if (!newPopulation) continue
    population = population ? [...population, newPopulation] : [newPopulation]
  }

  /**
   * Retrieve criteria + groups
   *
   */
  const exploreRequest = (currentItem: any) => {
    const { criteria } = currentItem

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criteriaItems = [...criteriaItems, criterion]
      } else {
        criteriaGroup = [...criteriaGroup, { ...criterion }]
        if (criterion && criterion.criteria && criterion.criteria.length > 0) {
          exploreRequest(criterion)
        }
      }
    }
  }

  if (request !== undefined) {
    criteriaGroup = [...criteriaGroup, { ...request }]
    exploreRequest(request)
  } else {
    return { population, criteria: [], criteriaGroup: [] }
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
            currentCriterion.title = 'Critère démographique'
            currentCriterion.ageType = currentCriterion.ageType ? currentCriterion.ageType : null
            currentCriterion.years = currentCriterion.years ? currentCriterion.years : [0, 130]
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

                if (value?.search('le') === 0) {
                  const date = value?.replace('le', '') ? moment().subtract(value?.replace('le', ''), 'days') : null
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
                } else if (value?.search('ge') === 0) {
                  const date = value?.replace('ge', '')
                    ? moment().subtract(+value?.replace('ge', '') + 1, 'days')
                    : null
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
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_ENCOUNTER: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de prise en charge'
          currentCriterion.duration = currentCriterion.duration ? currentCriterion.duration : [0, 100]
          currentCriterion.durationType = currentCriterion.durationType
            ? currentCriterion.durationType
            : { id: 'day', label: 'jours' }
          currentCriterion.ageType = currentCriterion.ageType
            ? currentCriterion.ageType
            : { id: 'year', label: 'années' }
          currentCriterion.years = currentCriterion.years ? currentCriterion.years : [0, 130]
          currentCriterion.admissionMode = currentCriterion.admissionMode ? currentCriterion.admissionMode : []
          currentCriterion.entryMode = currentCriterion.entryMode ? currentCriterion.entryMode : []
          currentCriterion.exitMode = currentCriterion.exitMode ? currentCriterion.exitMode : []
          currentCriterion.priseEnChargeType = currentCriterion.priseEnChargeType
            ? currentCriterion.priseEnChargeType
            : []
          currentCriterion.typeDeSejour = currentCriterion.typeDeSejour ? currentCriterion.typeDeSejour : []
          currentCriterion.fileStatus = currentCriterion.fileStatus ? currentCriterion.fileStatus : []
          currentCriterion.reason = currentCriterion.reason ? currentCriterion.reason : []
          currentCriterion.destination = currentCriterion.destination ? currentCriterion.destination : []
          currentCriterion.provenance = currentCriterion.provenance ? currentCriterion.provenance : []
          currentCriterion.admission = currentCriterion.admission ? currentCriterion.admission : []
          currentCriterion.discharge = currentCriterion.discharge ? currentCriterion.discharge : []

          if (element.encounterDateRange) {
            currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
            currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
          }

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
                if (value?.search('ge') === 0) {
                  currentCriterion.duration[0] = +value?.replace('ge', '') || 0
                } else if (value?.search('le') === 0) {
                  currentCriterion.duration[1] = +value?.replace('le', '') || 100
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
              case ENCOUNTER_MIN_BIRTHDATE:
              case ENCOUNTER_MAX_BIRTHDATE: {
                const ageType = [
                  { id: 'year', label: 'années' },
                  { id: 'month', label: 'mois' },
                  { id: 'day', label: 'jours' }
                ]

                if (value?.search('ge') === 0) {
                  currentCriterion.years[0] = +value?.replace('ge', '') || 0
                } else if (value?.search('le') === 0) {
                  currentCriterion.years[1] = +value?.replace('le', '') || 130
                }

                if (currentCriterion.years[1] % 31 === 0) {
                  currentCriterion.ageType = ageType[1]
                  currentCriterion.years[0] = currentCriterion.years[0] / 31
                  currentCriterion.years[1] = currentCriterion.years[1] / 31
                } else if (currentCriterion.years[1] % 365 === 0) {
                  currentCriterion.ageType = ageType[0]
                  currentCriterion.years[0] = currentCriterion.years[0] / 365
                  currentCriterion.years[1] = currentCriterion.years[1] / 365
                } else {
                  currentCriterion.ageType = ageType[2]
                }
                break
              }
              case ENCOUNTER_ENTRYMODE: {
                const entryModesIds = value?.split(',')
                const newEntryModesIds = entryModesIds?.map((entryModeId: any) => ({ id: entryModeId }))
                if (!newEntryModesIds) continue

                currentCriterion.entryMode = currentCriterion.entryMode
                  ? [...currentCriterion.entryMode, ...newEntryModesIds]
                  : newEntryModesIds
                break
              }
              case ENCOUNTER_EXITMODE: {
                const exitModesIds = value?.split(',')
                const newExitModesIds = exitModesIds?.map((exitModeId: any) => ({ id: exitModeId }))
                if (!newExitModesIds) continue

                currentCriterion.exitMode = currentCriterion.exitMode
                  ? [...currentCriterion.exitMode, ...newExitModesIds]
                  : newExitModesIds
                break
              }
              case ENCOUNTER_PRISENCHARGETYPE: {
                const priseEnChargeTypesIds = value?.split(',')
                const newPriseEnChargeTypesIds = priseEnChargeTypesIds?.map((priseEnChargeTypeId: any) => ({
                  id: priseEnChargeTypeId
                }))
                if (!newPriseEnChargeTypesIds) continue

                currentCriterion.priseEnChargeType = currentCriterion.priseEnChargeType
                  ? [...currentCriterion.priseEnChargeType, ...newPriseEnChargeTypesIds]
                  : newPriseEnChargeTypesIds
                break
              }
              case ENCOUNTER_TYPEDESEJOUR: {
                const typeDeSejoursIds = value?.split(',')
                const newTypeDeSejoursIds = typeDeSejoursIds?.map((typeDeSejourId: any) => ({
                  id: typeDeSejourId
                }))
                if (!newTypeDeSejoursIds) continue

                currentCriterion.typeDeSejour = currentCriterion.typeDeSejour
                  ? [...currentCriterion.typeDeSejour, ...newTypeDeSejoursIds]
                  : newTypeDeSejoursIds
                break
              }
              case ENCOUNTER_FILESTATUS: {
                const fileStatusIds = value?.split(',')
                const newFileStatusIds = fileStatusIds?.map((fileStatusId: any) => ({
                  id: fileStatusId
                }))
                if (!newFileStatusIds) continue

                currentCriterion.fileStatus = currentCriterion.fileStatus
                  ? [...currentCriterion.fileStatus, ...newFileStatusIds]
                  : newFileStatusIds
                break
              }
              case ENCOUNTER_REASON: {
                const dischargeIds = value?.split(',')
                const newDischargeIds = dischargeIds?.map((dischargeId: any) => ({
                  id: dischargeId
                }))
                if (!newDischargeIds) continue

                currentCriterion.reason = currentCriterion.reason
                  ? [...currentCriterion.reason, ...newDischargeIds]
                  : newDischargeIds
                break
              }
              case ENCOUNTER_ADMISSIONMODE: {
                const admissionModeIds = value?.split(',')
                const newAdmissionModeIds = admissionModeIds?.map((admissionModeId: any) => ({
                  id: admissionModeId
                }))
                if (!newAdmissionModeIds) continue

                currentCriterion.admissionMode = currentCriterion.admissionMode
                  ? [...currentCriterion.admissionMode, ...newAdmissionModeIds]
                  : newAdmissionModeIds
                break
              }
              case ENCOUNTER_DESTINATION: {
                const destinationIds = value?.split(',')
                const newDestinationIds = destinationIds?.map((destinationId: any) => ({
                  id: destinationId
                }))
                if (!newDestinationIds) continue

                currentCriterion.destination = currentCriterion.destination
                  ? [...currentCriterion.destination, ...newDestinationIds]
                  : newDestinationIds
                break
              }
              case ENCOUNTER_PROVENANCE: {
                const provenanceIds = value?.split(',')
                const newProvenanceIds = provenanceIds?.map((provenanceId: any) => ({
                  id: provenanceId
                }))
                if (!newProvenanceIds) continue

                currentCriterion.provenance = currentCriterion.provenance
                  ? [...currentCriterion.provenance, ...newProvenanceIds]
                  : newProvenanceIds
                break
              }
              case ENCOUNTER_ADMISSION: {
                const admissionIds = value?.split(',')
                const newAdmissionIds = admissionIds?.map((admissionId: any) => ({
                  id: admissionId
                }))
                if (!newAdmissionIds) continue

                currentCriterion.admission = currentCriterion.admission
                  ? [...currentCriterion.admission, ...newAdmissionIds]
                  : newAdmissionIds
                break
              }
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_COMPOSITION: {
        currentCriterion.title = 'Critère de document'
        currentCriterion.search = currentCriterion.search ? currentCriterion.search : null
        currentCriterion.docType = currentCriterion.docType ? currentCriterion.docType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.occurrenceComparator = currentCriterion.occurrenceComparator
          ? currentCriterion.occurrenceComparator
          : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir
            // This `replaceAll` is necessary because if a user searches `_text=first && second` we have a bug with filterFhir.split('&')
            .split('&')
            .map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case COMPOSITION_TEXT: {
                currentCriterion.search = value ? decodeURIComponent(value) : ''
                break
              }
              case COMPOSITION_TYPE: {
                const docTypeIds = value?.split(',')
                const newDocTypeIds = docTypes.filter((docType: DocType) =>
                  docTypeIds?.find((docTypeId) => docTypeId === docType.code)
                )

                if (!newDocTypeIds) continue

                currentCriterion.docType = currentCriterion.docType
                  ? [...currentCriterion.docType, ...newDocTypeIds]
                  : newDocTypeIds
                break
              }
              case 'status':
              case 'type:not':
              case 'empty':
                break
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CONDITION: {
        currentCriterion.title = 'Critère de diagnostic'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CONDITION_CODE_ALL_HIERARCHY:
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
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_PROCEDURE: {
        currentCriterion.title = "Critères d'actes CCAM"
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case PROCEDURE_CODE_ALL_HIERARCHY:
              case PROCEDURE_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CLAIM: {
        currentCriterion.title = 'Critère de GHM'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CLAIM_CODE_ALL_HIERARCHY:
              case CLAIM_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_MEDICATION_REQUEST:
      case RESSOURCE_TYPE_MEDICATION_ADMINISTRATION: {
        currentCriterion.title = 'Critère de médicament'
        currentCriterion.mode = currentCriterion.mode ? currentCriterion.mode : []
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.prescriptionType = currentCriterion.prescriptionType ? currentCriterion.prescriptionType : []
        currentCriterion.administration = currentCriterion.administration ? currentCriterion.administration : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case MEDICATION_CODE_ALL_HIERARCHY:
              case MEDICATION_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case MEDICATION_PRESCRIPTION_TYPE: {
                const prescriptionTypeIds = value?.split(',')
                const newPrescription = prescriptionTypeIds?.map((prescriptionTypeId: any) => ({
                  id: prescriptionTypeId
                }))
                if (!newPrescription) continue

                currentCriterion.prescriptionType = currentCriterion.prescriptionType
                  ? [...currentCriterion.prescriptionType, ...newPrescription]
                  : newPrescription
                break
              }
              case MEDICATION_ADMINISTRATION: {
                const administrationIds = value?.split(',')
                const newAdministration = administrationIds?.map((administrationId: any) => ({ id: administrationId }))
                if (!newAdministration) continue

                currentCriterion.administration = currentCriterion.administration
                  ? [...currentCriterion.administration, ...newAdministration]
                  : newAdministration
                break
              }
              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_OBSERVATION: {
        currentCriterion.title = 'Critère de biologie'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.isLeaf = currentCriterion.isLeaf ? currentCriterion.isLeaf : false
        currentCriterion.valueMin = currentCriterion.valueMin ? currentCriterion.valueMin : 0
        currentCriterion.valueMax = currentCriterion.valueMax ? currentCriterion.valueMax : 0
        currentCriterion.valueComparator = currentCriterion.valueComparator ? currentCriterion.valueComparator : '>='
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

        if (element.occurrence) {
          currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
          currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
        }

        if (element.dateRangeList) {
          currentCriterion.startOccurrence = element.dateRangeList[0].minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.endOccurrence = element.dateRangeList[0].maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.encounterDateRange) {
          currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
          currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
        }

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          const nbValueComparators = element?.filterFhir.match(/value-quantity-value/g)?.length
          // TODO: remplacer value-quantity-value par vraie regex

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null

            switch (key) {
              case OBSERVATION_CODE_ALL_HIERARCHY:
              case OBSERVATION_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode

                // TODO: pas propre vvvv
                if (currentCriterion.code.length === 1) {
                  try {
                    const checkChildrenResp = await services.cohortCreation.fetchBiologyHierarchy(
                      currentCriterion.code?.[0].id
                    )

                    if (checkChildrenResp.length === 0) {
                      currentCriterion.isLeaf = true
                    }
                  } catch (error) {
                    console.error('Erreur lors du check des enfants du code de biologie sélectionné', error)
                  }
                }

                break
              }

              case OBSERVATION_VALUE: {
                let valueComparator = ''
                let valueMin = 0
                let valueMax = 0

                if (value?.search('le') === 0) {
                  valueComparator = '<='
                  valueMin = parseInt(value?.replace('le', '')) ?? 0
                } else if (value?.search('lt') === 0) {
                  valueComparator = '<'
                  valueMin = parseInt(value?.replace('lt', '')) ?? 0
                } else if (value?.search('ge') === 0) {
                  if (nbValueComparators === 2) {
                    valueComparator = '<x>'
                    valueMax = parseInt(value?.replace('ge', '')) ?? 0
                  } else {
                    valueComparator = '>='
                    valueMin = parseInt(value?.replace('ge', '')) ?? 0
                  }
                } else if (value?.search('gt') === 0) {
                  valueComparator = '>'
                  valueMin = parseInt(value?.replace('gt', '')) ?? 0
                } else {
                  valueComparator = '='
                  valueMin = parseInt(value ?? '0')
                }

                currentCriterion.valueComparator = valueComparator
                currentCriterion.valueMin = valueMin
                currentCriterion.valueMax = valueMax

                break
              }

              default:
                currentCriterion.error = true
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_IPP_LIST: {
        currentCriterion.title = 'Critère de liste IPP'
        currentCriterion.search = currentCriterion.search ? currentCriterion.search : null

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null

            switch (key) {
              case IPP_LIST_FHIR: {
                currentCriterion.search = value ?? ''
                break
              }
              default:
                currentCriterion.error = true
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
  ) =>
    _criteriaGroup && _criteriaGroup.length > 0
      ? _criteriaGroup
          .map((groupItem: any) => ({
            id: groupItem._id,
            title: 'Groupe de critère',
            criteriaIds:
              groupItem.criteria && groupItem.criteria.length > 0
                ? groupItem.criteria.map((criteria: RequeteurCriteriaType | RequeteurGroupType) => criteria._id)
                : [],
            isSubGroup: groupItem.isSubItem,
            isInclusive: groupItem.isInclusive,
            type: groupItem._type
          }))
          .sort((prev, next) => next.id - prev.id)
      : []

  let _criteriaGroup = convertJsonObjectsToCriteriaGroup(criteriaGroup)
  const criteriaGroupSaved = [..._criteriaGroup]
  // Reset Group criteriaIds
  _criteriaGroup = _criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

  criteriaItems = criteriaItems.map((_criteria, index) => {
    // Get the parent of current critria
    const parentGroup = criteriaGroupSaved.find((itemGroup) =>
      itemGroup.criteriaIds.find((criteriaId) => criteriaId === _criteria._id)
    )
    if (parentGroup) {
      const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)
      // Assign the new criterion identifier to its group
      if (indexOfParent !== -1) {
        _criteriaGroup[indexOfParent] = {
          ..._criteriaGroup[indexOfParent],
          criteriaIds: [..._criteriaGroup[indexOfParent].criteriaIds, index + 1]
        }
      }
    }
    return { ..._criteria, _id: index + 1 }
  })

  // // Re-assign id and criteria to groups
  for (let index = 0; index < _criteriaGroup.length; index++) {
    const _criteriaGroupItem = _criteriaGroup[index]
    const newId = index * -1

    // Search parent
    const parentGroup = criteriaGroupSaved.find((itemGroup) =>
      itemGroup.criteriaIds.find((criteriaId) => criteriaId === _criteriaGroupItem.id)
    )
    if (parentGroup) {
      // Get index
      const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)

      // Assign the new criteria group identifier to it group parent
      if (indexOfParent !== -1) {
        let newCriteriaIds =
          _criteriaGroup[indexOfParent] && _criteriaGroup[indexOfParent].criteriaIds?.length > 0
            ? _criteriaGroup[indexOfParent].criteriaIds
            : criteriaGroupSaved[indexOfParent].criteriaIds

        // Delete old assignment
        // If ID changes, delete it
        if (newId !== _criteriaGroupItem.id)
          newCriteriaIds = newCriteriaIds.filter((elem) => elem !== _criteriaGroupItem.id)

        // Assign new id and filter doublon (parent group)
        newCriteriaIds = [...newCriteriaIds, newId].filter((item, index, array) => array.indexOf(item) === index)
        _criteriaGroup[indexOfParent].criteriaIds = newCriteriaIds
      }
    }

    // Assign new id (current group)
    _criteriaGroup[index].id = newId
  }

  // End of unbuild
  return {
    population,
    criteria: await convertJsonObjectsToCriteria(criteriaItems),
    criteriaGroup: _criteriaGroup
  }
}

/**
 * This function calls all functions to fetch data contained inside `src/components/CreationCohort/DataList_Criteria` list
 *
 */
export const getDataFromFetch = async (
  _criteria: any,
  selectedCriteria: SelectedCriteriaType[],
  oldCriteriaList?: any
) => {
  for (const _criterion of _criteria) {
    const oldCriterion = oldCriteriaList
      ? oldCriteriaList?.find((oldCriterionItem: any) => oldCriterionItem.id === _criterion.id)
      : []
    if (_criterion.fetch) {
      if (!_criterion.data) _criterion.data = {}
      const fetchKeys = Object.keys(_criterion.fetch)

      for (const fetchKey of fetchKeys) {
        const dataKey = fetchKey.replace('fetch', '').replace(/(\b[A-Z])(?![A-Z])/g, ($1) => $1.toLowerCase())
        switch (dataKey) {
          case 'atcData':
          case 'biologyData':
          case 'ghmData':
          case 'ccamData':
          case 'cim10Diagnostic': {
            if (_criterion.data[dataKey] === 'loading') _criterion.data[dataKey] = []
            const currentSelectedCriteria = selectedCriteria.filter(
              (criterion: SelectedCriteriaType) =>
                criterion.type === _criterion.id ||
                // V-- [ Link with Medication and `MedicationAdministration` or `MedicationRequest` ]
                (_criterion.id === 'Medication' &&
                  (criterion.type === RESSOURCE_TYPE_MEDICATION_REQUEST ||
                    criterion.type === RESSOURCE_TYPE_MEDICATION_ADMINISTRATION))
            )

            if (currentSelectedCriteria) {
              for (const currentcriterion of currentSelectedCriteria) {
                if (
                  currentcriterion &&
                  !(
                    currentcriterion.type === RESSOURCE_TYPE_PATIENT ||
                    currentcriterion.type === RESSOURCE_TYPE_ENCOUNTER ||
                    currentcriterion.type === RESSOURCE_TYPE_IPP_LIST ||
                    currentcriterion.type === RESSOURCE_TYPE_COMPOSITION
                  ) &&
                  currentcriterion.code &&
                  currentcriterion.code.length > 0
                ) {
                  for (const code of currentcriterion.code) {
                    const allreadyHere = oldCriterion?.data?.[dataKey]
                      ? oldCriterion?.data?.[dataKey].find((data: any) => data.id === code?.id)
                      : undefined

                    if (!allreadyHere) {
                      _criterion.data[dataKey] = [
                        ..._criterion.data[dataKey],
                        ...(await _criterion.fetch[fetchKey](code?.id, true))
                      ]
                    } else {
                      _criterion.data[dataKey] = [..._criterion.data[dataKey], allreadyHere]
                    }
                  }
                }
              }
            }
            break
          }
          default:
            if (
              oldCriterion &&
              oldCriterion?.data &&
              oldCriterion?.data?.[dataKey] &&
              oldCriterion?.data?.[dataKey] === 'loading'
            ) {
              _criterion.data[dataKey] = await _criterion.fetch[fetchKey]()
            }
            break
        }
      }
    }

    _criterion.subItems =
      _criterion.subItems && _criterion.subItems.length > 0
        ? await getDataFromFetch(_criterion.subItems, selectedCriteria, oldCriterion?.subItems ?? [])
        : []
  }
  return _criteria
}

export const joinRequest = async (oldJson: string, newJson: string, parentId: number | null) => {
  const oldRequest = JSON.parse(oldJson) as RequeteurSearchType
  const newRequest = JSON.parse(newJson) as RequeteurSearchType

  const changeIdOfRequest = (request: any) => {
    const { criteria } = request

    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criterion._id += 128
      } else {
        criterion._id -= 128
        if (criterion && criterion.criteria && criterion.criteria.length > 0) {
          criterion.criteria = changeIdOfRequest(criterion)
        }
      }
    }
    return criteria
  }

  const criteriaGroupFromNewRequest: RequeteurGroupType = {
    _id: (newRequest?.request?._id ?? 0) - 128,
    _type: newRequest.request?._type === 'andGroup' ? 'andGroup' : 'orGroup',
    isInclusive: true,
    criteria: changeIdOfRequest(newRequest.request)
  }

  const fillRequestWithNewRequest = (criterionGroup?: RequeteurGroupType) => {
    if (!criterionGroup) return criterionGroup

    if (criterionGroup._id === parentId) {
      criterionGroup.criteria = [...criterionGroup.criteria, criteriaGroupFromNewRequest]
    }

    if (!criterionGroup.criteria) return criterionGroup
    const { criteria = [] } = criterionGroup
    for (let criterion of criteria) {
      // @ts-ignore
      if (criterion?._type === 'orGroup' || criterion?._type === 'andGroup') {
        // @ts-ignore
        criterion = fillRequestWithNewRequest(criterion)
      }
    }
    return criterionGroup
  }

  const newJoinedRequest = {
    ...oldRequest,
    request: fillRequestWithNewRequest(oldRequest.request)
  }

  const { population, criteria, criteriaGroup } = await unbuildRequest(JSON.stringify(newJoinedRequest))

  return {
    json: buildRequest(population, criteria, criteriaGroup, []),
    criteria,
    criteriaGroup
  }
}
