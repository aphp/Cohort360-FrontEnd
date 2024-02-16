import moment from 'moment'

import services from 'services/aphp'
import {
  ScopeTreeRow,
  CriteriaGroupType,
  TemporalConstraintsType,
  CriteriaItemType,
  CriteriaItemDataCache
} from 'types'

import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  MEDICATION_ATC,
  IMAGING_STUDY_UID_URL,
  PROCEDURE_HIERARCHY
} from '../constants'
import { DocumentAttachmentMethod, LabelObject, SearchByTypes } from 'types/searchCriterias'
import { Comparators, RessourceType, SelectedCriteriaType, CriteriaDataKey } from 'types/requestCriterias'
import { parseOccurence } from './valueComparator'
import { parseDocumentAttachment } from './documentAttachment'
import {
  buildComparatorFilter,
  buildDateFilter,
  buildDurationFilter,
  buildLabelObjectFilter,
  buildObservationValueFilter,
  buildSearchFilter,
  buildSimpleFilter,
  buildWithDocumentFilter,
  unbuildAdvancedCriterias,
  unbuildDateFilter,
  unbuildDurationFilter,
  unbuildDocTypesFilter,
  unbuildEncounterServiceCriterias,
  unbuildLabelObjectFilter,
  unbuildObservationValueFilter,
  unbuildSearchFilter,
  buildEncounterServiceFilter
} from './mappers'

const REQUETEUR_VERSION = 'v1.4.0'

const IPP_LIST_FHIR = 'identifier.value'

const PATIENT_GENDER = 'gender'
const PATIENT_BIRTHDATE = 'birthdate'
const PATIENT_AGE_DAY = 'age-day'
const PATIENT_AGE_MONTH = 'age-month'
const PATIENT_DEATHDATE = 'death-date'
const PATIENT_DECEASED = 'deceased'

const ENCOUNTER_DURATION = 'length'
const ENCOUNTER_MIN_BIRTHDATE_DAY = 'start-age-visit'
const ENCOUNTER_MAX_BIRTHDATE_DAY = 'end-age-visit'
const ENCOUNTER_MIN_BIRTHDATE_MONTH = 'start-age-visit-month'
const ENCOUNTER_MAX_BIRTHDATE_MONTH = 'end-age-visit-month'
const ENCOUNTER_ENTRYMODE = 'admission-mode'
const ENCOUNTER_EXITMODE = 'discharge-disposition-mode'
const ENCOUNTER_PRISENCHARGETYPE = 'class'
const ENCOUNTER_TYPEDESEJOUR = 'stay'
const ENCOUNTER_FILESTATUS = 'status'
const ENCOUNTER_ADMISSIONMODE = 'reason-code'
const ENCOUNTER_REASON = 'admission-destination-type'
const ENCOUNTER_DESTINATION = 'discharge-disposition'
const ENCOUNTER_PROVENANCE = 'admit-source'
const ENCOUNTER_ADMISSION = 'admission-type'

const CLAIM_CODE = 'diagnosis'

const PROCEDURE_CODE = 'code'
const PROCEDURE_SOURCE = 'source'

const CONDITION_CODE = 'code'
const CONDITION_TYPE = 'orbis-status'

const COMPOSITION_TEXT = '_text'
const COMPOSITION_TITLE = 'description'
const COMPOSITION_TYPE = 'type'
const COMPOSITION_STATUS = 'docstatus'

const MEDICATION_CODE = 'medication'
const MEDICATION_PRESCRIPTION_TYPE = 'category'
const MEDICATION_ADMINISTRATION_ROUTE = 'dosage-route'
const MEDICATION_REQUEST_ROUTE = 'dosage-instruction-route'

const OBSERVATION_CODE = 'code'
export const OBSERVATION_VALUE = 'value-quantity'
const OBSERVATION_STATUS = 'status'
const ENCOUNTER_SERVICE_PROVIDER = 'encounter.encounter-care-site'
const ENCOUNTER_CONTEXT_SERVICE_PROVIDER = 'context.encounter-care-site'
const SERVICE_PROVIDER = 'encounter-care-site'

const IMAGING_STUDY_DATE = 'started'
const IMAGING_STUDY_MODALITIES = 'modality'
const IMAGING_STUDY_DESCRIPTION = 'description'
const IMAGING_STUDY_PROCEDURE = 'procedureCode'
const IMAGING_NB_OF_SERIES = 'numberOfSeries'
const IMAGING_NB_OF_INS = 'numberOfInstances'
const IMAGING_WITH_DOCUMENT = 'with-document'
const IMAGING_STUDY_UID = 'identifier'
const IMAGING_SERIES_DATE = 'series-started'
const IMAGING_SERIES_DESCRIPTION = 'series-description'
const IMAGING_SERIES_PROTOCOL = 'series-protocol'
const IMAGING_SERIES_MODALITIES = 'series-modality'
const IMAGING_SERIES_UID = 'series'

export const UNITE_EXECUTRICE = 'Unité exécutrice'
export const STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE = 'Structure hospitalière de prise en charge'

const DEFAULT_CRITERIA_ERROR: SelectedCriteriaType = {
  id: 0,
  isInclusive: false,
  type: RessourceType.PATIENT,
  title: '',
  genders: [],
  vitalStatus: [],
  birthdates: [null, null],
  deathDates: [null, null],
  age: [null, null]
}

const DEFAULT_GROUP_ERROR: CriteriaGroupType = {
  id: 0,
  title: '',
  type: 'andGroup',
  criteriaIds: []
}

export type RequeteurCriteriaType = {
  // CRITERIA
  _type: string
  _id: number
  isInclusive: boolean
  resourceType: RessourceType
  filterFhir: string
  occurrence?: {
    n: number
    operator?: Comparators
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
      temporalConstraints?: TemporalConstraintsType[]
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
        operator?: Comparators
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

const constructFilterFhir = (criterion: SelectedCriteriaType, deidentified: boolean): string => {
  let filterFhir = ''
  const filterReducer = (accumulator: string, currentValue: string): string =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

  switch (criterion.type) {
    case RessourceType.PATIENT: {
      filterFhir = [
        'active=true',
        buildLabelObjectFilter(criterion.genders, PATIENT_GENDER),
        buildLabelObjectFilter(criterion.vitalStatus, PATIENT_DECEASED),
        buildDateFilter(criterion.birthdates[0], PATIENT_BIRTHDATE, 'ge'),
        buildDateFilter(criterion.birthdates[1], PATIENT_BIRTHDATE, 'le'),
        buildDateFilter(criterion.deathDates[0], PATIENT_DEATHDATE, 'ge'),
        buildDateFilter(criterion.deathDates[1], PATIENT_DEATHDATE, 'le'),
        criterion.birthdates[0] === null && criterion.birthdates[1] === null
          ? buildDurationFilter(
              criterion.age[0],
              deidentified ? PATIENT_AGE_MONTH : PATIENT_AGE_DAY,
              'ge',
              deidentified
            )
          : '',
        criterion.birthdates[1] === null && criterion.birthdates[1] === null
          ? buildDurationFilter(
              criterion.age[1],
              deidentified ? PATIENT_AGE_MONTH : PATIENT_AGE_DAY,
              'le',
              deidentified
            )
          : ''
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RessourceType.ENCOUNTER: {
      deidentified = false //TODO erase this line when deidentified param for encounter is implemented
      filterFhir = [
        'subject.active=true',
        buildLabelObjectFilter(criterion.admissionMode, ENCOUNTER_ADMISSIONMODE),
        buildLabelObjectFilter(criterion.entryMode, ENCOUNTER_ENTRYMODE),
        buildLabelObjectFilter(criterion.exitMode, ENCOUNTER_EXITMODE),
        buildLabelObjectFilter(criterion.priseEnChargeType, ENCOUNTER_PRISENCHARGETYPE),
        buildLabelObjectFilter(criterion.typeDeSejour, ENCOUNTER_TYPEDESEJOUR),
        buildLabelObjectFilter(criterion.fileStatus, ENCOUNTER_FILESTATUS),
        buildLabelObjectFilter(criterion.destination, ENCOUNTER_DESTINATION),
        buildLabelObjectFilter(criterion.provenance, ENCOUNTER_PROVENANCE),
        buildLabelObjectFilter(criterion.admission, ENCOUNTER_ADMISSION),
        buildLabelObjectFilter(criterion.reason, ENCOUNTER_REASON),
        buildEncounterServiceFilter(criterion.encounterService, SERVICE_PROVIDER),
        buildDurationFilter(criterion?.duration?.[0], ENCOUNTER_DURATION, 'ge'),
        buildDurationFilter(criterion?.duration?.[1], ENCOUNTER_DURATION, 'le'),
        buildDurationFilter(
          criterion?.age[0],
          deidentified ? ENCOUNTER_MIN_BIRTHDATE_MONTH : ENCOUNTER_MIN_BIRTHDATE_DAY,
          'ge',
          deidentified
        ),
        buildDurationFilter(
          criterion?.age[1],
          deidentified ? ENCOUNTER_MAX_BIRTHDATE_MONTH : ENCOUNTER_MAX_BIRTHDATE_DAY,
          'le',
          deidentified
        )
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RessourceType.DOCUMENTS: {
      const unreducedFilterFhir = [
        `${COMPOSITION_STATUS}=final&type:not=doc-impor&contenttype=http://terminology.hl7.org/CodeSystem/v3-mediatypes|text/plain&subject.active=true`,
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER),
        buildSearchFilter(
          criterion.search,
          criterion.searchBy === SearchByTypes.TEXT ? COMPOSITION_TEXT : COMPOSITION_TITLE
        ),
        buildLabelObjectFilter(
          criterion.docType?.map((docType) => {
            return {
              id: docType.code
            } as LabelObject
          }),
          COMPOSITION_TYPE
        )
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CONDITION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        buildLabelObjectFilter(criterion.code, CONDITION_CODE, CONDITION_HIERARCHY),
        buildLabelObjectFilter(criterion.diagnosticType, CONDITION_TYPE),
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.PROCEDURE: {
      const unreducedFilterFhir = [
        'subject.active=true',
        buildLabelObjectFilter(criterion.code, PROCEDURE_CODE, PROCEDURE_HIERARCHY),
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER),
        buildSimpleFilter(criterion.source, PROCEDURE_SOURCE)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CLAIM: {
      const unreducedFilterFhir = [
        'patient.active=true',
        buildLabelObjectFilter(criterion.code, CLAIM_CODE, CLAIM_HIERARCHY),
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        buildLabelObjectFilter(
          criterion.administration,
          criterion.type === RessourceType.MEDICATION_REQUEST
            ? MEDICATION_REQUEST_ROUTE
            : MEDICATION_ADMINISTRATION_ROUTE
        ),
        buildEncounterServiceFilter(
          criterion.encounterService,
          criterion.type === RessourceType.MEDICATION_REQUEST
            ? ENCOUNTER_SERVICE_PROVIDER
            : ENCOUNTER_CONTEXT_SERVICE_PROVIDER
        ),
        buildLabelObjectFilter(criterion.code, MEDICATION_CODE, MEDICATION_ATC, true),
        criterion.type === RessourceType.MEDICATION_REQUEST
          ? buildLabelObjectFilter(criterion.prescriptionType, MEDICATION_PRESCRIPTION_TYPE)
          : ''
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.OBSERVATION: {
      const unreducedFilterFhir = [
        `subject.active=true&${OBSERVATION_STATUS}=Val`,
        buildLabelObjectFilter(criterion.code, OBSERVATION_CODE, BIOLOGY_HIERARCHY_ITM_ANABIO),
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER),
        buildObservationValueFilter(criterion, OBSERVATION_VALUE)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.IPP_LIST: {
      const unreducedFilterFhir = [`${criterion.search ? `${IPP_LIST_FHIR}=${criterion.search}` : ''}`].filter(
        (elem) => elem
      )
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.IMAGING: {
      filterFhir = [
        'patient.active=true',
        buildDateFilter(criterion.studyStartDate, IMAGING_STUDY_DATE, 'ge'),
        buildDateFilter(criterion.studyEndDate, IMAGING_STUDY_DATE, 'le'),
        buildDateFilter(criterion.seriesStartDate, IMAGING_SERIES_DATE, 'ge'),
        buildDateFilter(criterion.seriesEndDate, IMAGING_SERIES_DATE, 'le'),
        buildSearchFilter(criterion.studyDescription, IMAGING_STUDY_DESCRIPTION),
        buildSearchFilter(criterion.studyProcedure, IMAGING_STUDY_PROCEDURE),
        buildSearchFilter(criterion.seriesDescription, IMAGING_SERIES_DESCRIPTION),
        buildSearchFilter(criterion.seriesProtocol, IMAGING_SERIES_PROTOCOL),
        buildLabelObjectFilter(criterion.studyModalities, IMAGING_STUDY_MODALITIES),
        buildLabelObjectFilter(criterion.seriesModalities, IMAGING_SERIES_MODALITIES),
        buildEncounterServiceFilter(criterion.encounterService, ENCOUNTER_SERVICE_PROVIDER),
        buildComparatorFilter(criterion.numberOfSeries, criterion.seriesComparator, IMAGING_NB_OF_SERIES),
        buildComparatorFilter(criterion.numberOfIns, criterion.instancesComparator, IMAGING_NB_OF_INS),
        buildWithDocumentFilter(criterion, IMAGING_WITH_DOCUMENT),
        buildSimpleFilter(criterion.studyUid, IMAGING_STUDY_UID, IMAGING_STUDY_UID_URL),
        buildSimpleFilter(criterion.seriesUid, IMAGING_SERIES_UID)
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
  selectedPopulation: (ScopeTreeRow | undefined)[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroupType[],
  temporalConstraints: TemporalConstraintsType[]
): string {
  if (!selectedPopulation) return ''
  selectedPopulation = selectedPopulation.filter((elem) => elem !== undefined)
  const deidentified: boolean =
    selectedPopulation === null
      ? false
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

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
          resourceType: item.type ?? RessourceType.PATIENT,
          filterFhir: constructFilterFhir(item, deidentified),
          occurrence:
            !(item.type === RessourceType.PATIENT || item.type === RessourceType.IPP_LIST) && item.occurrence
              ? {
                  n: item.occurrence,
                  operator: item?.occurrenceComparator || undefined
                }
              : undefined,
          dateRangeList:
            !(item.type === RessourceType.PATIENT || item.type === RessourceType.IPP_LIST) &&
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
            !(item.type === RessourceType.PATIENT || item.type === RessourceType.IPP_LIST) &&
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

  const _retrieveInformationFromJson = async (element: RequeteurCriteriaType): Promise<any> => {
    const currentCriterion: any = {
      id: element._id,
      type: element.resourceType,
      isInclusive: element.isInclusive,
      title: ''
    }

    switch (element.resourceType) {
      case RessourceType.PATIENT: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
          currentCriterion.title = 'Critère démographique'
          currentCriterion.genders = []
          currentCriterion.vitalStatus = []
          currentCriterion.age = [null, null]
          currentCriterion.birthdates = [null, null]
          currentCriterion.deathDates = [null, null]
          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null

            switch (key) {
              case PATIENT_AGE_DAY:
              case PATIENT_AGE_MONTH: {
                if (value?.includes('ge')) {
                  currentCriterion.age[0] = unbuildDurationFilter(value, key === PATIENT_AGE_MONTH ? true : false)
                } else if (value?.includes('le')) {
                  currentCriterion.age[1] = unbuildDurationFilter(value, key === PATIENT_AGE_MONTH ? true : false)
                }
                break
              }
              case PATIENT_BIRTHDATE: {
                if (value?.includes('ge')) {
                  currentCriterion.birthdates[0] = unbuildDateFilter(value)
                } else if (value?.includes('le')) {
                  currentCriterion.birthdates[1] = unbuildDateFilter(value)
                }
                break
              }
              case PATIENT_DEATHDATE: {
                if (value?.includes('ge')) {
                  currentCriterion.deathDates[0] = unbuildDateFilter(value)
                } else if (value?.includes('le')) {
                  currentCriterion.deathDates[1] = unbuildDateFilter(value)
                }
                break
              }
              case PATIENT_GENDER: {
                unbuildLabelObjectFilter(currentCriterion, 'genders', value)
                break
              }
              case PATIENT_DECEASED: {
                unbuildLabelObjectFilter(currentCriterion, 'vitalStatus', value)
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
      case RessourceType.ENCOUNTER: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
          currentCriterion.title = 'Critère de prise en charge'
          currentCriterion.duration = [null, null]
          currentCriterion.age = [null, null]
          currentCriterion.admissionMode = []
          currentCriterion.entryMode = []
          currentCriterion.exitMode = []
          currentCriterion.priseEnChargeType = []
          currentCriterion.typeDeSejour = []
          currentCriterion.fileStatus = []
          currentCriterion.reason = []
          currentCriterion.destination = []
          currentCriterion.provenance = []
          currentCriterion.admission = []
          currentCriterion.discharge = []
          currentCriterion.encounterService = []
          currentCriterion.occurrence = null
          currentCriterion.startOccurrence = null
          currentCriterion.endOccurrence = null

          unbuildAdvancedCriterias(element, currentCriterion)

          for (const filter of filters) {
            const key = filter[0]
            const value = filter[1]
            switch (key) {
              case ENCOUNTER_DURATION: {
                if (value.includes('ge')) {
                  currentCriterion.duration[0] = unbuildDurationFilter(value)
                } else if (value.includes('le')) {
                  currentCriterion.duration[1] = unbuildDurationFilter(value)
                }
                break
              }
              case ENCOUNTER_MIN_BIRTHDATE_DAY:
              case ENCOUNTER_MIN_BIRTHDATE_MONTH: {
                currentCriterion.age[0] = unbuildDurationFilter(
                  value,
                  key === ENCOUNTER_MIN_BIRTHDATE_MONTH ? true : false
                )
                break
              }
              case ENCOUNTER_MAX_BIRTHDATE_DAY:
              case ENCOUNTER_MAX_BIRTHDATE_MONTH: {
                currentCriterion.age[1] = unbuildDurationFilter(
                  value,
                  key === ENCOUNTER_MAX_BIRTHDATE_MONTH ? true : false
                )
                break
              }
              case ENCOUNTER_ENTRYMODE: {
                unbuildLabelObjectFilter(currentCriterion, 'entryMode', value)
                break
              }
              case ENCOUNTER_EXITMODE: {
                unbuildLabelObjectFilter(currentCriterion, 'exitMode', value)
                break
              }
              case ENCOUNTER_PRISENCHARGETYPE: {
                unbuildLabelObjectFilter(currentCriterion, 'priseEnChargeType', value)
                break
              }
              case ENCOUNTER_TYPEDESEJOUR: {
                unbuildLabelObjectFilter(currentCriterion, 'typeDeSejour', value)
                break
              }
              case ENCOUNTER_FILESTATUS: {
                unbuildLabelObjectFilter(currentCriterion, 'fileStatus', value)
                break
              }
              case ENCOUNTER_REASON: {
                unbuildLabelObjectFilter(currentCriterion, 'reason', value)
                break
              }
              case ENCOUNTER_ADMISSIONMODE: {
                unbuildLabelObjectFilter(currentCriterion, 'admissionMode', value)
                break
              }
              case ENCOUNTER_DESTINATION: {
                unbuildLabelObjectFilter(currentCriterion, 'destination', value)
                break
              }
              case ENCOUNTER_PROVENANCE: {
                unbuildLabelObjectFilter(currentCriterion, 'provenance', value)
                break
              }
              case ENCOUNTER_ADMISSION: {
                unbuildLabelObjectFilter(currentCriterion, 'admission', value)
                break
              }
              case SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
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
      case RessourceType.DOCUMENTS: {
        currentCriterion.title = 'Critère de document'
        currentCriterion.search = currentCriterion.search ? currentCriterion.search : null
        currentCriterion.docType = currentCriterion.docType ? currentCriterion.docType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.occurrenceComparator = currentCriterion.occurrenceComparator
          ? currentCriterion.occurrenceComparator
          : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.encounterService = []

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case COMPOSITION_TITLE:
                currentCriterion.search = unbuildSearchFilter(value)
                currentCriterion.searchBy = SearchByTypes.DESCRIPTION
                break
              case COMPOSITION_TEXT: {
                currentCriterion.search = unbuildSearchFilter(value)
                currentCriterion.searchBy = SearchByTypes.TEXT
                break
              }
              case COMPOSITION_TYPE: {
                unbuildDocTypesFilter(currentCriterion, 'docType', value)
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
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
      case RessourceType.CONDITION: {
        currentCriterion.title = 'Critère de diagnostic'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.encounterService = []

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CONDITION_CODE: {
                unbuildLabelObjectFilter(currentCriterion, 'code', value)
                break
              }
              case CONDITION_TYPE: {
                unbuildLabelObjectFilter(currentCriterion, 'diagnosticType', value)
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
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
      case RessourceType.PROCEDURE: {
        currentCriterion.title = "Critères d'actes CCAM"
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.source = currentCriterion.source ? currentCriterion.source : null
        currentCriterion.encounterService = []

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case PROCEDURE_CODE: {
                unbuildLabelObjectFilter(currentCriterion, 'code', value)
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
                break
              }
              case 'subject.active':
                break
              case PROCEDURE_SOURCE: {
                currentCriterion.source = value
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
      case RessourceType.CLAIM: {
        currentCriterion.title = 'Critère de GHM'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.encounterService = []

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CLAIM_CODE: {
                unbuildLabelObjectFilter(currentCriterion, 'code', value)
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
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
      case RessourceType.MEDICATION_REQUEST:
      case RessourceType.MEDICATION_ADMINISTRATION: {
        currentCriterion.title = 'Critère de médicament'
        currentCriterion.mode = currentCriterion.mode ? currentCriterion.mode : []
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.prescriptionType = currentCriterion.prescriptionType ? currentCriterion.prescriptionType : []
        currentCriterion.administration = currentCriterion.administration ? currentCriterion.administration : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.encounterService = []

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case MEDICATION_CODE: {
                const codeIds = value?.replace(/https:\/\/.*?\|/g, '')
                unbuildLabelObjectFilter(currentCriterion, 'code', codeIds)
                break
              }
              case MEDICATION_PRESCRIPTION_TYPE: {
                unbuildLabelObjectFilter(currentCriterion, 'prescriptionType', value)
                break
              }
              case MEDICATION_REQUEST_ROUTE:
              case MEDICATION_ADMINISTRATION_ROUTE: {
                unbuildLabelObjectFilter(currentCriterion, 'administration', value)
                break
              }
              case 'subject.active':
                break
              case ENCOUNTER_CONTEXT_SERVICE_PROVIDER:
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
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
      case RessourceType.OBSERVATION: {
        currentCriterion.title = 'Critère de biologie'
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.isLeaf = currentCriterion.isLeaf ? currentCriterion.isLeaf : false
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.encounterService = []
        currentCriterion.searchByValue = [null, null]
        currentCriterion.valueComparator = Comparators.GREATER_OR_EQUAL

        unbuildAdvancedCriterias(element, currentCriterion)

        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

          unbuildObservationValueFilter(filters, currentCriterion)

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null

            switch (key) {
              case OBSERVATION_CODE: {
                unbuildLabelObjectFilter(currentCriterion, 'code', value)

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
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
                break
              }
              case OBSERVATION_VALUE:
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
      case RessourceType.IPP_LIST: {
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
      case RessourceType.IMAGING: {
        if (element.filterFhir) {
          const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
          currentCriterion.title = "Critère d'Imagerie"
          currentCriterion.studyStartDate = null
          currentCriterion.studyEndDate = null
          currentCriterion.studyModalities = []
          currentCriterion.studyDescription = ''
          currentCriterion.studyProcedure = ''
          currentCriterion.numberOfSeries = 1
          currentCriterion.seriesComparator = Comparators.GREATER_OR_EQUAL
          currentCriterion.numberOfIns = 1
          currentCriterion.instancesComparator = Comparators.GREATER_OR_EQUAL
          currentCriterion.withDocument = DocumentAttachmentMethod.NONE
          currentCriterion.studyUid = ''
          currentCriterion.seriesStartDate = null
          currentCriterion.seriesEndDate = null
          currentCriterion.seriesDescription = ''
          currentCriterion.seriesProtocol = ''
          currentCriterion.seriesModalities = []
          currentCriterion.seriesUid = ''
          currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
          currentCriterion.encounterService = []

          for (const filter of filters) {
            const key = filter[0]
            const value = filter[1]
            switch (key) {
              case IMAGING_STUDY_DATE: {
                if (value.includes('ge')) {
                  currentCriterion.studyStartDate = unbuildDateFilter(value)
                } else if (value.includes('le')) {
                  currentCriterion.studyEndDate = unbuildDateFilter(value)
                }
                break
              }
              case IMAGING_STUDY_MODALITIES: {
                const modalitiesValues = value?.replace(/^[*|]+/, '')
                unbuildLabelObjectFilter(currentCriterion, 'studyModalities', modalitiesValues)
                break
              }
              case IMAGING_STUDY_DESCRIPTION: {
                currentCriterion.studyDescription = unbuildSearchFilter(value)
                break
              }
              case IMAGING_STUDY_PROCEDURE: {
                currentCriterion.studyProcedure = unbuildSearchFilter(value)
                break
              }
              case IMAGING_NB_OF_SERIES: {
                const parsedOccurence = parseOccurence(value)
                currentCriterion.numberOfSeries = parsedOccurence.value
                currentCriterion.seriesComparator = parsedOccurence.comparator
                break
              }
              case IMAGING_NB_OF_INS: {
                const parsedOccurence = parseOccurence(value)
                currentCriterion.numberOfIns = parsedOccurence.value
                currentCriterion.instancesComparator = parsedOccurence.comparator
                break
              }
              case IMAGING_WITH_DOCUMENT: {
                const parsedDocumentAttachment = parseDocumentAttachment(value as DocumentAttachmentMethod)
                currentCriterion.withDocument = parsedDocumentAttachment.documentAttachmentMethod
                currentCriterion.daysOfDelay = parsedDocumentAttachment.daysOfDelay
                break
              }
              case IMAGING_STUDY_UID: {
                currentCriterion.studyUid = value.replace(`${IMAGING_STUDY_UID_URL}|`, '') ?? ''
                break
              }
              case IMAGING_SERIES_DATE: {
                if (value.includes('ge')) {
                  currentCriterion.seriesStartDate = unbuildDateFilter(value)
                } else if (value.includes('le')) {
                  currentCriterion.seriesEndDate = unbuildDateFilter(value)
                }
                break
              }
              case IMAGING_SERIES_DESCRIPTION: {
                currentCriterion.seriesDescription = unbuildSearchFilter(value)
                break
              }
              case IMAGING_SERIES_PROTOCOL: {
                currentCriterion.seriesProtocol = unbuildSearchFilter(value)
                break
              }
              case IMAGING_SERIES_MODALITIES: {
                const modalitiesValues = value?.replace(/^[*|]+/, '')
                unbuildLabelObjectFilter(currentCriterion, 'seriesModalities', modalitiesValues)
                break
              }
              case IMAGING_SERIES_UID: {
                currentCriterion.seriesUid = value ?? ''
                break
              }
              case ENCOUNTER_SERVICE_PROVIDER: {
                await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
                break
              }
            }
          }

          unbuildAdvancedCriterias(element, currentCriterion)
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
          .map(
            (groupItem: RequeteurGroupType) =>
              ({
                id: groupItem._id,
                title: 'Groupe de critères',
                criteriaIds:
                  groupItem.criteria && groupItem.criteria.length > 0
                    ? groupItem.criteria.map((criteria) => criteria._id)
                    : [],
                isSubGroup: !!groupItem.criteria.length,
                isInclusive: groupItem.isInclusive,
                type: groupItem._type
              } as CriteriaGroupType)
          )
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
  criteriaList: readonly CriteriaItemType[],
  selectedCriteria: SelectedCriteriaType[],
  oldCriteriaCache?: CriteriaItemDataCache[]
): Promise<CriteriaItemDataCache[]> => {
  const updatedCriteriaData: CriteriaItemDataCache[] = []
  for (const _criterion of criteriaList) {
    const criteriaDataCache: CriteriaItemDataCache = {
      data: {},
      criteriaType: _criterion.id
    }
    // here we do not populate new data with old data because the store froze the data (readonly) so they can't be updated
    const prevDataCache: CriteriaItemDataCache['data'] =
      oldCriteriaCache?.find((oldCriterionItem) => oldCriterionItem.criteriaType === _criterion.id)?.data || {}

    if (_criterion.fetch) {
      const dataKeys = Object.keys(_criterion.fetch) as CriteriaDataKey[]

      for (const dataKey of dataKeys) {
        switch (dataKey) {
          case CriteriaDataKey.MEDICATION_DATA:
          case CriteriaDataKey.BIOLOGY_DATA:
          case CriteriaDataKey.GHM_DATA:
          case CriteriaDataKey.CCAM_DATA:
          case CriteriaDataKey.CIM_10_DIAGNOSTIC: {
            const currentSelectedCriteria = selectedCriteria.filter(
              (criterion: SelectedCriteriaType) =>
                criterion.type === _criterion.id ||
                // V-- [ Link with Medication and `MedicationAdministration` or `MedicationRequest` ]
                (_criterion.id === 'Medication' &&
                  (criterion.type === RessourceType.MEDICATION_REQUEST ||
                    criterion.type === RessourceType.MEDICATION_ADMINISTRATION))
            )

            if (currentSelectedCriteria) {
              for (const currentcriterion of currentSelectedCriteria) {
                if (
                  currentcriterion &&
                  !(
                    currentcriterion.type === RessourceType.PATIENT ||
                    currentcriterion.type === RessourceType.ENCOUNTER ||
                    currentcriterion.type === RessourceType.IPP_LIST ||
                    currentcriterion.type === RessourceType.DOCUMENTS ||
                    currentcriterion.type === RessourceType.IMAGING
                  ) &&
                  currentcriterion.code &&
                  currentcriterion.code.length > 0
                ) {
                  for (const code of currentcriterion.code) {
                    const prevData = prevDataCache[dataKey]?.find((data: any) => data.id === code?.id)
                    const codeData = prevData ? [prevData] : await _criterion.fetch[dataKey]?.(code?.id, true)
                    const existingCodes = criteriaDataCache.data[dataKey] || []
                    criteriaDataCache.data[dataKey] = [...existingCodes, ...(codeData || [])]
                  }
                }
              }
            }
            break
          }
          default:
            criteriaDataCache.data[dataKey] = prevDataCache[dataKey]
            if (criteriaDataCache.data[dataKey] === undefined) {
              criteriaDataCache.data[dataKey] = await _criterion.fetch[dataKey]?.()
            }
            break
        }
      }
    }
    updatedCriteriaData.push(criteriaDataCache)

    if (_criterion.subItems && _criterion.subItems.length > 0) {
      updatedCriteriaData.push(...(await getDataFromFetch(_criterion.subItems, selectedCriteria, oldCriteriaCache)))
    }
  }
  return updatedCriteriaData
}

export const joinRequest = async (oldJson: string, newJson: string, parentId: number | null): Promise<any> => {
  const oldRequest = JSON.parse(oldJson) as RequeteurSearchType
  const newRequest = JSON.parse(newJson) as RequeteurSearchType

  const isRequeteurGroupType = (
    criterion: RequeteurGroupType | RequeteurCriteriaType
  ): criterion is RequeteurGroupType => {
    return criterion && !!(criterion as RequeteurGroupType).criteria.length
  }

  const changeIdOfRequest = (
    criteria: (RequeteurGroupType | RequeteurCriteriaType)[]
  ): (RequeteurGroupType | RequeteurCriteriaType)[] => {
    for (const criterion of criteria) {
      if (criterion._type === 'basicResource') {
        criterion._id += 128
      } else {
        criterion._id -= 128
        if (isRequeteurGroupType(criterion) && criterion.criteria && criterion.criteria.length > 0) {
          criterion.criteria = changeIdOfRequest(criterion.criteria)
        }
      }
    }
    return criteria
  }

  const criteriaGroupFromNewRequest: RequeteurGroupType = {
    _id: (newRequest?.request?._id ?? 0) - 128,
    _type: newRequest.request?._type === 'andGroup' ? 'andGroup' : 'orGroup',
    isInclusive: true,
    criteria: changeIdOfRequest(newRequest.request?.criteria || [])
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
  pmsiHierarchy: any[],
  valueSetSystem?: string
): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems?.filter(({ id }) => id !== 'loading')
  const foundItem = selectedItems.find((selectedItem) => {
    if (selectedItem.id === searchedItem.id || (selectedItem.id == '*' && valueSetSystem !== 'UCD')) {
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
    if (isSingleItemNotSelected) {
      const singleItemNotSelected = searchedItem.subItems?.find((searchedSubItem: any) =>
        selectedItems.find((selectedItem) => selectedItem.id !== searchedSubItem.id)
      )
      return findSelectedInListAndSubItems(selectedItems, singleItemNotSelected, pmsiHierarchy)
    }
  }
  return false
}
