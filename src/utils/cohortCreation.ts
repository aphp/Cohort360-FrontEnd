import moment from 'moment'

import services from 'services/aphp'
import {
  ScopeTreeRow,
  SelectedCriteriaType,
  CriteriaGroupType,
  TemporalConstraintsType,
  DocType,
  SearchByTypes,
  Calendar,
  CalendarRequestLabel,
  CalendarLabel,
  Comparators,
  CriteriaItemType
} from 'types'

import docTypes from 'assets/docTypes.json'
import { BIOLOGY_HIERARCHY_ITM_ANABIO, CLAIM_HIERARCHY, CONDITION_HIERARCHY, PROCEDURE_HIERARCHY } from '../constants'

const REQUETEUR_VERSION = 'v1.4.0'

const RESSOURCE_TYPE_IPP_LIST: 'IPPList' = 'IPPList'
const IPP_LIST_FHIR = 'identifier.value'

export const RESSOURCE_TYPE_PATIENT: 'Patient' = 'Patient'
const PATIENT_GENDER = 'gender'
const PATIENT_BIRTHDATE = 'age-day'
const PATIENT_DECEASED = 'deceased'

const RESSOURCE_TYPE_ENCOUNTER: 'Encounter' = 'Encounter'
const ENCOUNTER_LENGTH = 'length'
const ENCOUNTER_MIN_BIRTHDATE = 'start-age-visit'
const ENCOUNTER_MAX_BIRTHDATE = 'end-age-visit'
const ENCOUNTER_ENTRYMODE = 'admission-mode'
const ENCOUNTER_EXITMODE = 'discharge-disposition-mode'
const ENCOUNTER_PRISENCHARGETYPE = 'class'
const ENCOUNTER_TYPEDESEJOUR = 'stay'
const ENCOUNTER_FILESTATUS = 'status'
const ENCOUNTER_ADMISSIONMODE = 'reason-code'
const ENCOUNTER_REASON = 'destination-type'
const ENCOUNTER_DESTINATION = 'destination'
const ENCOUNTER_PROVENANCE = 'admit-source'
const ENCOUNTER_ADMISSION = 'admission-type'

export const RESSOURCE_TYPE_CLAIM: 'Claim' = 'Claim'
const CLAIM_CODE = 'diagnosis-hierarchy'
const CLAIM_CODE_ALL_HIERARCHY = 'diagnosis'

export const RESSOURCE_TYPE_PROCEDURE: 'Procedure' = 'Procedure'
const PROCEDURE_CODE = 'code-hierarchy'
const PROCEDURE_CODE_ALL_HIERARCHY = 'code'

export const RESSOURCE_TYPE_CONDITION: 'Condition' = 'Condition'
const CONDITION_CODE = 'code-hierarchy'
const CONDITION_CODE_ALL_HIERARCHY = 'code'
const CONDITION_TYPE = 'type'

const RESSOURCE_TYPE_COMPOSITION: 'DocumentReference' = 'DocumentReference'
const COMPOSITION_TEXT = '_text'
const COMPOSITION_TITLE = 'description'
const COMPOSITION_TYPE = 'type'
const COMPOSITION_STATUS = 'docstatus'

const RESSOURCE_TYPE_MEDICATION_REQUEST: 'MedicationRequest' = 'MedicationRequest' // = Prescription
const RESSOURCE_TYPE_MEDICATION_ADMINISTRATION: 'MedicationAdministration' = 'MedicationAdministration' // = Administration
const MEDICATION_CODE = 'medication-hierarchy'
const MEDICATION_CODE_ALL_HIERARCHY = 'medication'
// const MEDICATION_UCD = 'code_id'
const MEDICATION_PRESCRIPTION_TYPE = 'type'
const MEDICATION_ADMINISTRATION = 'route'

const RESSOURCE_TYPE_OBSERVATION: 'Observation' = 'Observation'
const OBSERVATION_CODE = 'code-hierarchy'
const OBSERVATION_CODE_ALL_HIERARCHY = 'code'
const OBSERVATION_VALUE = 'value-quantity'
const OBSERVATION_STATUS = 'status'
const ENCOUNTER_SERVICE_PROVIDER = 'encounter.encounter-care-site'
const SERVICE_PROVIDER = 'service-provider'

export const UNITE_EXECUTRICE = 'Unité exécutrice'
export const STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE = 'Structure hospitalière de prise en charge'

const DEFAULT_CRITERIA_ERROR: SelectedCriteriaType = {
  id: 0,
  isInclusive: false,
  type: 'Patient',
  title: '',
  gender: [],
  vitalStatus: [],
  years: [0, 130],
  ageType: { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR }
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
    datePreference?: 'event_date' | 'encounter_end_date' | 'encounter_start_date'
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

export const getCalendarMultiplicator = (type: Calendar): number => {
  switch (type) {
    case Calendar.MONTH:
      return 31
    case Calendar.YEAR:
      return 365
    default:
      return 1
  }
}

const constructFilterFhir = (criterion: SelectedCriteriaType): string => {
  let filterFhir = ''

  const filterReducer = (accumulator: any, currentValue: any): string =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator
  const searchReducer = (accumulator: any, currentValue: any): string =>
    accumulator || accumulator === false ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator

  switch (criterion.type) {
    case RESSOURCE_TYPE_PATIENT: {
      let ageMin = ''
      let ageMax = ''

      ageMin = `${PATIENT_BIRTHDATE}=ge${+criterion.years[0] * getCalendarMultiplicator(criterion.ageType?.id)}`
      ageMax = `${PATIENT_BIRTHDATE}=le${+criterion.years[1] * getCalendarMultiplicator(criterion.ageType?.id)}`

      filterFhir = [
        'active=true',
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
        `${ageMin ? `${ageMin}` : ''}`,
        `${ageMax ? `${ageMax}` : ''}`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RESSOURCE_TYPE_ENCOUNTER: {
      // Ignore TypeScript because we need to check if array is not empty
      // @ts-ignore
      filterFhir = [
        'subject.active=true',
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
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion?.duration?.[0] !== null && criterion?.durationType?.[0] !== null
            ? `${ENCOUNTER_LENGTH}=ge${+criterion.duration[0] * getCalendarMultiplicator(criterion.durationType[0].id)}`
            : ''
        }`,
        `${
          criterion?.duration?.[1] !== null && criterion?.durationType?.[1] !== null
            ? `${ENCOUNTER_LENGTH}=le${+criterion.duration[1] * getCalendarMultiplicator(criterion.durationType[1].id)}`
            : ''
        }`,
        `${
          criterion?.age?.[0] !== null && criterion?.ageType?.[0] !== null
            ? `${ENCOUNTER_MIN_BIRTHDATE}=ge${+criterion.age[0] * getCalendarMultiplicator(criterion.ageType[0].id)}`
            : ''
        }`,
        `${
          criterion?.age?.[1] !== null && criterion?.ageType?.[1] !== null
            ? `${ENCOUNTER_MAX_BIRTHDATE}=le${+criterion.age[1] * getCalendarMultiplicator(criterion.ageType[1].id)}`
            : ''
        }`
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
      const unreducedFilterFhir = [
        `${COMPOSITION_STATUS}=final&type:not=doc-impor&contenttype=${encodeURIComponent(
          'http://terminology.hl7.org/CodeSystem/v3-mediatypes|text/plain'
        )}&subject.active=true`,
        `${
          criterion.search
            ? `${criterion.searchBy === SearchByTypes.text ? COMPOSITION_TEXT : COMPOSITION_TITLE}=${encodeURIComponent(
                criterion.search
              )}`
            : ''
        }`,
        `${
          criterion.docType && criterion.docType.length > 0
            ? `${COMPOSITION_TYPE}=${criterion.docType.map((docType: DocType) => docType.code).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_CONDITION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CONDITION_CODE_ALL_HIERARCHY}=${CONDITION_HIERARCHY}|*`
              : `${CONDITION_CODE}=${criterion.code.map((code: any) => code.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.diagnosticType && criterion.diagnosticType.length > 0
            ? `${CONDITION_TYPE}=${criterion.diagnosticType
                .map((diagnosticType: any) => diagnosticType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_PROCEDURE: {
      const unreducedFilterFhir = [
        'subject.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${PROCEDURE_CODE_ALL_HIERARCHY}=${PROCEDURE_HIERARCHY}|*`
              : `${PROCEDURE_CODE}=${criterion.code
                  .map((diagnosticType: any) => diagnosticType.id)
                  .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_CLAIM: {
      const unreducedFilterFhir = [
        'patient.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CLAIM_CODE_ALL_HIERARCHY}=${CLAIM_HIERARCHY}|*`
              : `${CLAIM_CODE}=${criterion.code.map((diagnosticType: any) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_MEDICATION_REQUEST:
    case RESSOURCE_TYPE_MEDICATION_ADMINISTRATION: {
      const unreducedFilterFhir = [
        'subject.active=true',
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
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_OBSERVATION: {
      let valueComparatorFilter = ''
      if (criterion.valueComparator) {
        switch (criterion.valueComparator) {
          case Comparators.LESS:
            valueComparatorFilter = 'lt'
            break
          case Comparators.LESS_OR_EQUAL:
            valueComparatorFilter = 'le'
            break
          case Comparators.EQUAL:
            valueComparatorFilter = ''
            break
          case Comparators.GREATER:
            valueComparatorFilter = 'gt'
            break
          case Comparators.GREATER_OR_EQUAL:
            valueComparatorFilter = 'ge'
            break
          default:
            valueComparatorFilter = ''
            break
        }
      }

      const unreducedFilterFhir = [
        `subject.active=true&${OBSERVATION_STATUS}=Val`,
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${OBSERVATION_CODE_ALL_HIERARCHY}=${BIOLOGY_HIERARCHY_ITM_ANABIO}|*`
              : `${OBSERVATION_CODE}=${criterion.code
                  .map((diagnosticType: any) => diagnosticType.id)
                  .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem: any) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.isLeaf &&
          criterion.code &&
          criterion.code.length === 1 &&
          criterion.valueComparator &&
          (typeof criterion.valueMin === 'number' || typeof criterion.valueMax === 'number')
            ? criterion.valueComparator === Comparators.BETWEEN && criterion.valueMax
              ? `${OBSERVATION_VALUE}=le${criterion.valueMax}&${OBSERVATION_VALUE}=ge${criterion.valueMin}`
              : `${OBSERVATION_VALUE}=${valueComparatorFilter}${criterion.valueMin}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RESSOURCE_TYPE_IPP_LIST: {
      const unreducedFilterFhir = [`${criterion.search ? `${IPP_LIST_FHIR}=${criterion.search}` : ''}`].filter(
        (elem) => elem
      )
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
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
): string {
  if (!selectedPopulation) return ''
  selectedPopulation = selectedPopulation.filter((elem) => elem !== undefined)

  const exploreCriteriaGroup = (itemIds: number[]): (RequeteurCriteriaType | RequeteurGroupType)[] => {
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
            !(item.type === RESSOURCE_TYPE_PATIENT || item.type === RESSOURCE_TYPE_IPP_LIST) && item.occurrence
              ? {
                  n: item.occurrence,
                  operator: item?.occurrenceComparator
                }
              : undefined,
          dateRangeList:
            !(item.type === RESSOURCE_TYPE_PATIENT || item.type === RESSOURCE_TYPE_IPP_LIST) &&
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
        ?.map((_selectedPopulation: any) => _selectedPopulation.cohort_id)
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

export async function unbuildRequest(_json: string): Promise<any> {
  let population: (ScopeTreeRow | undefined)[] | null = null
  let criteriaItems: RequeteurCriteriaType[] = []
  let criteriaGroup: RequeteurGroupType[] = []
  let temporalConstraints: TemporalConstraintsType[] = []

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

  // retrieve temporal constraints
  if (request && request.temporalConstraints) {
    temporalConstraints = request.temporalConstraints
  }

  /**
   * Retrieve criteria + groups
   *
   */
  const exploreRequest = (currentItem: any): void => {
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

  const getValueFromCalendarType = (type: Calendar, value: number): number => {
    if (type === Calendar.YEAR) {
      return value / 365
    }
    if (type === Calendar.MONTH) {
      return value / 31
    }
    return value
  }

  const getCalendarType = (value: number) => {
    if (value % 365 === 0) {
      return { id: Calendar.YEAR, requestLabel: CalendarRequestLabel.YEAR, criteriaLabel: CalendarLabel.YEAR }
    }
    if (value % 31 === 0) {
      return { id: Calendar.MONTH, requestLabel: CalendarRequestLabel.MONTH, criteriaLabel: CalendarLabel.MONTH }
    }
    return { id: Calendar.DAY, requestLabel: CalendarRequestLabel.DAY, criteriaLabel: CalendarLabel.DAY }
  }

  const _retrieveInformationFromJson = async (element: RequeteurCriteriaType): Promise<any> => {
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

                if (value?.includes('ge')) {
                  const ageMin = value?.replace('ge', '')
                  currentCriterion.ageType = getCalendarType(+ageMin)
                  currentCriterion.years[0] = getValueFromCalendarType(currentCriterion.ageType?.id, +ageMin)
                } else if (value?.includes('le')) {
                  const ageMax = value?.replace('le', '')
                  currentCriterion.ageType = getCalendarType(+ageMax)
                  currentCriterion.years[1] = getValueFromCalendarType(currentCriterion.ageType?.id, +ageMax)
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
              case 'active':
                break
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
          currentCriterion.duration = currentCriterion.duration ? currentCriterion.duration : [null, null]
          currentCriterion.durationType = currentCriterion.durationType
            ? currentCriterion.durationType
            : [
                { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY },
                { id: Calendar.DAY, criteriaLabel: CalendarLabel.DAY, requestLabel: CalendarRequestLabel.DAY }
              ]
          currentCriterion.ageType = currentCriterion.ageType
            ? currentCriterion.ageType
            : [
                { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR },
                { id: Calendar.YEAR, criteriaLabel: CalendarLabel.YEAR, requestLabel: CalendarRequestLabel.YEAR }
              ]
          currentCriterion.age = currentCriterion.age ? currentCriterion.age : [null, null]
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
          currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          if (element.occurrence) {
            currentCriterion.occurrence = element.occurrence ? element.occurrence.n : null
            currentCriterion.occurrenceComparator = element.occurrence ? element.occurrence.operator : null
          }

          if (element.encounterDateRange) {
            currentCriterion.encounterStartDate = element.encounterDateRange.minDate?.replace('T00:00:00Z', '') ?? null
            currentCriterion.encounterEndDate = element.encounterDateRange.maxDate?.replace('T00:00:00Z', '') ?? null
          }

          for (const filter of filters) {
            const key = filter[0]
            const value = filter[1]
            switch (key) {
              case ENCOUNTER_LENGTH: {
                if (value.includes('ge')) {
                  const min = value?.replace('ge', '') ?? 0
                  currentCriterion.durationType[0] = getCalendarType(+min)
                  currentCriterion.duration[0] = getValueFromCalendarType(currentCriterion.durationType[0].id, +min)
                } else if (value.includes('le')) {
                  const max = value?.replace('le', '') ?? 0
                  currentCriterion.durationType[1] = getCalendarType(+max)
                  currentCriterion.duration[1] = getValueFromCalendarType(currentCriterion.durationType[1].id, +max)
                }
                break
              }
              case ENCOUNTER_MIN_BIRTHDATE: {
                const min = value?.replace('ge', '') ?? 130
                currentCriterion.ageType[0] = getCalendarType(+min)
                currentCriterion.age[0] = getValueFromCalendarType(currentCriterion.ageType[0].id, +min)

                break
              }
              case ENCOUNTER_MAX_BIRTHDATE: {
                const max = value?.replace('le', '') ?? 130
                currentCriterion.ageType[1] = getCalendarType(+max)
                currentCriterion.age[1] = getValueFromCalendarType(currentCriterion.ageType[1].id, +max)
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
              case 'subject.active':
                break
              case SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices
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
              case COMPOSITION_TITLE:
                currentCriterion.search = value ? decodeURIComponent(value) : ''
                currentCriterion.searchBy = SearchByTypes.description
                break
              case COMPOSITION_TEXT: {
                currentCriterion.search = value ? decodeURIComponent(value) : ''
                currentCriterion.searchBy = SearchByTypes.text
                break
              }
              case COMPOSITION_TYPE: {
                const docTypeIds = value?.split(',')
                const newDocTypeIds = docTypes.docTypes.filter((docType: DocType) =>
                  docTypeIds?.find((docTypeId) => docTypeId === docType.code)
                )

                if (!newDocTypeIds) continue

                currentCriterion.docType = currentCriterion.docType
                  ? [...currentCriterion.docType, ...newDocTypeIds]
                  : newDocTypeIds
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices
                break
              }
              case COMPOSITION_STATUS:
              case 'subject.active':
              case 'type:not':
              case 'contenttype':
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
                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, { id: '*' }] : { id: '*' }
                break
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
              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices
                break
              }

              case 'subject.active':
                break

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
                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, { id: '*' }] : { id: '*' }
                break
              case PROCEDURE_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices

                break
              }
              case 'subject.active':
                break
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
                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, { id: '*' }] : { id: '*' }
                break
              case CLAIM_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId: any) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices
                break
              }
              case 'patient.active':
                break
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
              case 'subject.active':
                break
              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices
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
                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, { id: '*' }] : { id: '*' }
                break
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
                let valueMin
                let valueMax

                if (value?.search('le') === 0) {
                  valueComparator = Comparators.LESS_OR_EQUAL
                  valueMin = parseInt(value?.replace('le', ''))
                } else if (value?.search('lt') === 0) {
                  valueComparator = Comparators.LESS
                  valueMin = parseInt(value?.replace('lt', ''))
                } else if (value?.search('ge') === 0) {
                  if (nbValueComparators === 2) {
                    valueComparator = Comparators.BETWEEN
                    valueMax = parseInt(value?.replace('ge', ''))
                  } else {
                    valueComparator = Comparators.GREATER_OR_EQUAL
                    valueMin = parseInt(value?.replace('ge', ''))
                  }
                } else if (value?.search('gt') === 0) {
                  valueComparator = Comparators.GREATER
                  valueMin = parseInt(value?.replace('gt', ''))
                } else {
                  valueComparator = Comparators.EQUAL
                  valueMin = parseInt(value ?? '0')
                }

                currentCriterion.valueComparator = valueComparator
                currentCriterion.valueMin = valueMin
                currentCriterion.valueMax = valueMax

                break
              }

              case ENCOUNTER_SERVICE_PROVIDER: {
                if (!value) continue

                const updatedEncounterServices: ScopeTreeRow[] = await services.perimeters.getScopesWithSubItems(value)

                currentCriterion.encounterService = currentCriterion.encounterService
                  ? [...currentCriterion.encounterService, ...updatedEncounterServices]
                  : updatedEncounterServices

                break
              }
              case OBSERVATION_STATUS:
              case 'subject.active':
                break
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
  const idMap: { [key: number]: number } = {} // Object to hold previous and new IDs mapping

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
    idMap[_criteria._id] = index + 1
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

  const updatedConstraintsIds = temporalConstraints.map((constraint) => {
    const oldIds = constraint.idList as number[]
    const newIds = oldIds.map((id) => idMap[id] ?? id)
    return { ...constraint, idList: newIds }
  })

  // End of unbuild
  return {
    population,
    criteria: await convertJsonObjectsToCriteria(criteriaItems),
    criteriaGroup: _criteriaGroup,
    temporalConstraints: updatedConstraintsIds
  }
}

/**
 * This function calls all functions to fetch data contained inside `src/components/CreationCohort/DataList_Criteria` list
 *
 */
export const getDataFromFetch = async (
  _criteria: readonly CriteriaItemType[],
  selectedCriteria: SelectedCriteriaType[],
  oldCriteriaList?: any
): Promise<any> => {
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
          case 'MedicationData':
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
            } else if (
              oldCriterion &&
              oldCriterion?.data &&
              oldCriterion?.data?.[dataKey] &&
              oldCriterion?.data?.[dataKey] !== 'loading'
            ) {
              _criterion.data[dataKey] = oldCriterion.data[dataKey]
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

export const joinRequest = async (oldJson: string, newJson: string, parentId: number | null): Promise<any> => {
  const oldRequest = JSON.parse(oldJson) as RequeteurSearchType
  const newRequest = JSON.parse(newJson) as RequeteurSearchType

  const changeIdOfRequest = (request: any): any => {
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

  const fillRequestWithNewRequest = (criterionGroup?: RequeteurGroupType): RequeteurGroupType | undefined => {
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
export const findSelectedInListAndSubItems = (
  selectedItems: any[],
  searchedItem: any,
  pmsiHierarchy: any[]
): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems?.filter(({ id }) => id !== 'loading')
  const foundItem = selectedItems.find((selectedItem) => {
    if (selectedItem.id === searchedItem.id || selectedItem.id == '*') {
      return true
    }
    return selectedItem.subItems
      ? findSelectedInListAndSubItems(selectedItem.subItems, searchedItem, pmsiHierarchy)
      : false
  })
  if (foundItem) {
    return true
  }
  if (
    searchedItem.subItems &&
    searchedItem.subItems.length > 0 &&
    !(searchedItem.subItems.length === 1 && searchedItem.subItems[0].id === 'loading')
  ) {
    const numberOfSubItemsSelected = searchedItem.subItems?.filter((searchedSubItem: any) =>
      selectedItems.find((selectedItem) => selectedItem.id === searchedSubItem.id)
    )?.length
    if (searchedItem.subItems?.length === numberOfSubItemsSelected) {
      return true
    }
    const isSingleItemNotSelected = (searchedItem.subItems?.length ?? 0 - (numberOfSubItemsSelected ?? 0)) === 1
    if (numberOfSubItemsSelected && isSingleItemNotSelected) {
      const singleItemNotSelected = searchedItem.subItems?.find((searchedSubItem: any) =>
        selectedItems.find((selectedItem) => selectedItem.id !== searchedSubItem.id)
      )
      return findSelectedInListAndSubItems(selectedItems, singleItemNotSelected, pmsiHierarchy)
    }
  }
  return false
}
