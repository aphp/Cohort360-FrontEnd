import moment from 'moment'

import services from 'services/aphp'
import {
  ScopeTreeRow,
  CriteriaGroupType,
  TemporalConstraintsType,
  CriteriaItemType,
  CriteriaItemDataCache
} from 'types'

import docTypes from 'assets/docTypes.json'
import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  MEDICATION_ATC,
  IMAGING_STUDY_UID_URL,
  PROCEDURE_HIERARCHY
} from '../constants'
import { DocumentAttachmentMethod, SearchByTypes } from 'types/searchCriterias'
import { Calendar } from 'types/dates'
import {
  convertDurationToString,
  convertDurationToTimestamp,
  convertStringToDuration,
  convertTimestampToDuration
} from './age'
import { Comparators, DocType, RessourceType, SelectedCriteriaType, CriteriaDataKey } from 'types/requestCriterias'
import { comparatorToFilter, parseOccurence } from './valueComparator'
import { parseDocumentAttachment } from './documentAttachment'

const REQUETEUR_VERSION = 'v1.4.0'

const IPP_LIST_FHIR = 'identifier.value'

const PATIENT_GENDER = 'gender'
const PATIENT_BIRTHDATE = 'birthdate'
const PATIENT_AGE = 'age-day'
const PATIENT_DEATHDATE = 'death-date'
const PATIENT_DECEASED = 'deceased'

const ENCOUNTER_DURATION = 'length'
const ENCOUNTER_MIN_BIRTHDATE = 'start-age-visit'
const ENCOUNTER_MAX_BIRTHDATE = 'end-age-visit'
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
const CLAIM_CODE_ALL_HIERARCHY = 'diagnosis'

const PROCEDURE_CODE = 'code'
const PROCEDURE_CODE_ALL_HIERARCHY = 'code'
const PROCEDURE_SOURCE = 'source'

const CONDITION_CODE = 'code'
const CONDITION_CODE_ALL_HIERARCHY = 'code'
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
const OBSERVATION_CODE_ALL_HIERARCHY = 'code'
const OBSERVATION_VALUE = 'value-quantity'
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

type RequeteurCriteriaType = {
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
    case RessourceType.PATIENT: {
      const ageMin = convertDurationToTimestamp(
        convertStringToDuration(criterion.age?.[0]) || { year: 0, month: 0, day: 0 }
      )
      const ageMax = convertDurationToTimestamp(
        convertStringToDuration(criterion.age?.[1]) || { year: 130, month: 0, day: 0 }
      )

      const ageMinCriterion = `${PATIENT_AGE}=ge${ageMin}`
      const ageMaxCriterion = `${PATIENT_AGE}=le${ageMax}`

      filterFhir = [
        'active=true',
        `${
          criterion.genders && criterion.genders.length > 0
            ? `${PATIENT_GENDER}=${criterion.genders.map((gender: any) => gender.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.vitalStatus && criterion.vitalStatus.length > 0
            ? `${PATIENT_DECEASED}=${criterion.vitalStatus.map((vitalStatus) => vitalStatus.id).reduce(searchReducer)}`
            : ''
        }`,
        criterion.birthdates[0] === null && criterion.birthdates[1] === null ? `${ageMinCriterion}` : '',
        criterion.birthdates[0] === null && criterion.birthdates[1] === null ? `${ageMaxCriterion}` : '',
        criterion.birthdates[0]
          ? `${PATIENT_BIRTHDATE}=ge${moment(criterion.birthdates[0]).format('YYYY-MM-DD[T00:00:00Z]')}`
          : '',
        criterion.birthdates[1]
          ? `${PATIENT_BIRTHDATE}=le${moment(criterion.birthdates[1]).format('YYYY-MM-DD[T00:00:00Z]')}`
          : '',
        criterion.deathDates[0]
          ? `${PATIENT_DEATHDATE}=ge${moment(criterion.deathDates[0]).format('YYYY-MM-DD[T00:00:00Z]')}`
          : '',
        criterion.deathDates[1]
          ? `${PATIENT_DEATHDATE}=le${moment(criterion.deathDates[1]).format('YYYY-MM-DD[T00:00:00Z]')}`
          : ''
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RessourceType.ENCOUNTER: {
      filterFhir = [
        'subject.active=true',
        `${
          criterion.admissionMode && criterion.admissionMode.length > 0
            ? `${ENCOUNTER_ADMISSIONMODE}=${criterion.admissionMode
                .map((admissionMode) => admissionMode.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.entryMode && criterion.entryMode.length > 0
            ? `${ENCOUNTER_ENTRYMODE}=${criterion.entryMode.map((entryMode) => entryMode.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.exitMode && criterion.exitMode.length > 0
            ? `${ENCOUNTER_EXITMODE}=${criterion.exitMode.map((exitMode) => exitMode.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.priseEnChargeType && criterion.priseEnChargeType.length > 0
            ? `${ENCOUNTER_PRISENCHARGETYPE}=${criterion.priseEnChargeType
                .map((priseEnChargeType) => priseEnChargeType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.typeDeSejour && criterion.typeDeSejour.length > 0
            ? `${ENCOUNTER_TYPEDESEJOUR}=${criterion.typeDeSejour
                .map((typeDeSejour) => typeDeSejour.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.fileStatus && criterion.fileStatus.length > 0
            ? `${ENCOUNTER_FILESTATUS}=${criterion.fileStatus.map((fileStatus) => fileStatus.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.reason && criterion.reason.length > 0
            ? `${ENCOUNTER_REASON}=${criterion.reason.map((reason) => reason.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.destination && criterion.destination.length > 0
            ? `${ENCOUNTER_DESTINATION}=${criterion.destination
                .map((destination) => destination.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.provenance && criterion.provenance.length > 0
            ? `${ENCOUNTER_PROVENANCE}=${criterion.provenance.map((provenance) => provenance.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.admission && criterion.admission.length > 0
            ? `${ENCOUNTER_ADMISSION}=${criterion.admission.map((admission) => admission.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.duration?.[0]
            ? `${ENCOUNTER_DURATION}=ge${convertDurationToTimestamp(convertStringToDuration(criterion.duration?.[0]))}`
            : ''
        }`,
        `${
          criterion.duration?.[1]
            ? `${ENCOUNTER_DURATION}=le${convertDurationToTimestamp(convertStringToDuration(criterion.duration?.[1]))}`
            : ''
        }`,
        `${
          criterion.age?.[0]
            ? `${ENCOUNTER_MIN_BIRTHDATE}=ge${convertDurationToTimestamp(convertStringToDuration(criterion.age?.[0]))}`
            : ''
        }`,
        `${
          criterion.age?.[1]
            ? `${ENCOUNTER_MAX_BIRTHDATE}=le${convertDurationToTimestamp(convertStringToDuration(criterion.age?.[1]))}`
            : ''
        }`
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RessourceType.DOCUMENTS: {
      const unreducedFilterFhir = [
        `${COMPOSITION_STATUS}=final&type:not=doc-impor&contenttype='http://terminology.hl7.org/CodeSystem/v3-mediatypes|text/plain'&subject.active=true`,
        `${
          criterion.search
            ? `${criterion.searchBy === SearchByTypes.TEXT ? COMPOSITION_TEXT : COMPOSITION_TITLE}=${encodeURIComponent(
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
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CONDITION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CONDITION_CODE_ALL_HIERARCHY}=${CONDITION_HIERARCHY}|*`
              : `${CONDITION_CODE}=${criterion.code.map((code) => code.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.diagnosticType && criterion.diagnosticType.length > 0
            ? `${CONDITION_TYPE}=${criterion.diagnosticType
                .map((diagnosticType) => diagnosticType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.PROCEDURE: {
      const unreducedFilterFhir = [
        'subject.active=true',
        `${criterion.source ? `${PROCEDURE_SOURCE}=${criterion.source}` : ''}`,
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${PROCEDURE_CODE_ALL_HIERARCHY}=${PROCEDURE_HIERARCHY}|*`
              : `${PROCEDURE_CODE}=${criterion.code.map((diagnosticType) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CLAIM: {
      const unreducedFilterFhir = [
        'patient.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? criterion.code.find((code) => code.id === '*')
              ? `${CLAIM_CODE_ALL_HIERARCHY}=${CLAIM_HIERARCHY}|*`
              : `${CLAIM_CODE}=${criterion.code.map((diagnosticType) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        `${
          criterion.code && criterion.code.length > 0
            ? `${MEDICATION_CODE}=${criterion.code
                .map((diagnosticType: any) =>
                  diagnosticType.id === '*' ? `${MEDICATION_ATC}|*` : `${diagnosticType.system}|${diagnosticType.id}`
                )
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.type === RessourceType.MEDICATION_REQUEST &&
          criterion.prescriptionType &&
          criterion.prescriptionType.length > 0
            ? `${MEDICATION_PRESCRIPTION_TYPE}=${criterion.prescriptionType
                .map((prescriptionType) => prescriptionType.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.administration && criterion.administration.length > 0
            ? `${
                criterion.type === RessourceType.MEDICATION_REQUEST
                  ? MEDICATION_REQUEST_ROUTE
                  : MEDICATION_ADMINISTRATION_ROUTE
              }=${criterion.administration.map((administration) => administration.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${
                criterion.type === RessourceType.MEDICATION_REQUEST
                  ? ENCOUNTER_SERVICE_PROVIDER
                  : ENCOUNTER_CONTEXT_SERVICE_PROVIDER
              }=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.OBSERVATION: {
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
              : `${OBSERVATION_CODE}=${criterion.code.map((diagnosticType) => diagnosticType.id).reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
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
        `${
          criterion.studyStartDate
            ? `${IMAGING_STUDY_DATE}=ge${moment(criterion.studyStartDate).format('YYYY-MM-DD[T00:00:00Z]')}`
            : ''
        }`,
        `${
          criterion.studyEndDate
            ? `${IMAGING_STUDY_DATE}=le${moment(criterion.studyEndDate).format('YYYY-MM-DD[T00:00:00Z]')}`
            : ''
        }`,
        `${
          criterion.studyModalities && criterion.studyModalities.length > 0
            ? `${IMAGING_STUDY_MODALITIES}=*|${criterion.studyModalities
                .map((modality: any) => modality.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${
          criterion.studyDescription
            ? `${IMAGING_STUDY_DESCRIPTION}=${encodeURIComponent(criterion.studyDescription)}`
            : ''
        }`,
        `${
          criterion.studyProcedure ? `${IMAGING_STUDY_PROCEDURE}=${encodeURIComponent(criterion.studyProcedure)}` : ''
        }`,
        `${
          criterion.numberOfSeries
            ? `${IMAGING_NB_OF_SERIES}=${comparatorToFilter(criterion.seriesComparator)}${criterion.numberOfSeries}`
            : ''
        }`,
        `${
          criterion.numberOfIns
            ? `${IMAGING_NB_OF_INS}=${comparatorToFilter(criterion.instancesComparator)}${criterion.numberOfIns}`
            : ''
        }`,
        `${
          criterion.withDocument !== DocumentAttachmentMethod.NONE
            ? `${IMAGING_WITH_DOCUMENT}=${
                criterion.withDocument === DocumentAttachmentMethod.ACCESS_NUMBER
                  ? DocumentAttachmentMethod.ACCESS_NUMBER
                  : `INFERENCE_TEMPOREL${
                      criterion.daysOfDelay !== null && criterion.daysOfDelay !== ''
                        ? `_${criterion.daysOfDelay}_J`
                        : ''
                    }`
              }`
            : ''
        }`,
        `${criterion.studyUid ? `${IMAGING_STUDY_UID}=${IMAGING_STUDY_UID_URL}|${criterion.studyUid}` : ''}`,
        `${
          criterion.seriesStartDate
            ? `${IMAGING_SERIES_DATE}=ge${moment(criterion.seriesStartDate).format('YYYY-MM-DD[T00:00:00Z]')}`
            : ''
        }`,
        `${
          criterion.seriesEndDate
            ? `${IMAGING_SERIES_DATE}=le${moment(criterion.seriesEndDate).format('YYYY-MM-DD[T00:00:00Z]')}`
            : ''
        }`,
        `${
          criterion.seriesDescription
            ? `${IMAGING_SERIES_DESCRIPTION}=${encodeURIComponent(criterion.seriesDescription)}`
            : ''
        }`,
        `${
          criterion.seriesProtocol ? `${IMAGING_SERIES_PROTOCOL}=${encodeURIComponent(criterion.seriesProtocol)}` : ''
        }`,
        `${
          criterion.seriesModalities && criterion.seriesModalities.length > 0
            ? `${IMAGING_SERIES_MODALITIES}=*|${criterion.seriesModalities
                .map((modality: any) => modality.id)
                .reduce(searchReducer)}`
            : ''
        }`,
        `${criterion.seriesUid ? `${IMAGING_SERIES_UID}=${criterion.seriesUid}` : ''}`,
        `${
          criterion.encounterService && criterion.encounterService.length > 0
            ? `${ENCOUNTER_SERVICE_PROVIDER}=${criterion.encounterService
                .map((encounterServiceItem) => encounterServiceItem.id)
                .reduce(searchReducer)}`
            : ''
        }`
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
          filterFhir: constructFilterFhir(item),
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
              case PATIENT_AGE: {
                if (value?.includes('ge')) {
                  const ageMin = value?.replace('ge', '')
                  currentCriterion.age[0] = convertDurationToString(convertTimestampToDuration(+ageMin))
                } else if (value?.includes('le')) {
                  const ageMax = value?.replace('le', '')
                  currentCriterion.age[1] = convertDurationToString(convertTimestampToDuration(+ageMax))
                }
                break
              }
              case PATIENT_BIRTHDATE: {
                if (value?.includes('ge')) {
                  currentCriterion.birthdates[0] = value.replace('T00:00:00Z', '').replace('ge', '')
                } else if (value?.includes('le')) {
                  currentCriterion.birthdates[1] = value.replace('T00:00:00Z', '').replace('le', '')
                }
                break
              }
              case PATIENT_DEATHDATE: {
                if (value?.includes('ge')) {
                  currentCriterion.deathDates[0] = value.replace('T00:00:00Z', '').replace('ge', '')
                } else if (value?.includes('le')) {
                  currentCriterion.deathDates[1] = value.replace('T00:00:00Z', '').replace('le', '')
                }
                break
              }
              case PATIENT_GENDER: {
                const genderIds = value?.split(',')
                const newGenderIds = genderIds?.map((genderId) => ({ id: genderId }))
                if (!newGenderIds) continue

                currentCriterion.genders = currentCriterion.gender
                  ? [...currentCriterion.gender, ...newGenderIds]
                  : newGenderIds
                break
              }
              case PATIENT_DECEASED: {
                const vitalStatuses = value?.split(',') || []
                const _vitalStatuses = vitalStatuses?.map((vitalStatusId) => ({ id: vitalStatusId }))
                if (!_vitalStatuses) continue

                currentCriterion.vitalStatus = currentCriterion.vitalStatus
                  ? [...currentCriterion.vitalStatus, ..._vitalStatuses]
                  : _vitalStatuses
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
          currentCriterion.occurrence = null
          currentCriterion.startOccurrence = null
          currentCriterion.endOccurrence = null

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
              case ENCOUNTER_DURATION: {
                if (value.includes('ge')) {
                  const durationMin = value?.replace('ge', '')
                  currentCriterion.duration[0] = convertDurationToString(convertTimestampToDuration(+durationMin))
                } else if (value.includes('le')) {
                  const durationMax = value?.replace('le', '')
                  currentCriterion.duration[1] = convertDurationToString(convertTimestampToDuration(+durationMax))
                }
                break
              }
              case ENCOUNTER_MIN_BIRTHDATE: {
                const ageMin = value?.replace('ge', '')
                currentCriterion.age[0] = convertDurationToString(convertTimestampToDuration(+ageMin))
                break
              }
              case ENCOUNTER_MAX_BIRTHDATE: {
                const ageMax = value?.replace('le', '')
                currentCriterion.age[1] = convertDurationToString(convertTimestampToDuration(+ageMax))
                break
              }
              case ENCOUNTER_ENTRYMODE: {
                const entryModesIds = value?.split(',')
                const newEntryModesIds = entryModesIds?.map((entryModeId) => ({ id: entryModeId }))
                if (!newEntryModesIds) continue

                currentCriterion.entryMode = currentCriterion.entryMode
                  ? [...currentCriterion.entryMode, ...newEntryModesIds]
                  : newEntryModesIds
                break
              }
              case ENCOUNTER_EXITMODE: {
                const exitModesIds = value?.split(',')
                const newExitModesIds = exitModesIds?.map((exitModeId) => ({ id: exitModeId }))
                if (!newExitModesIds) continue

                currentCriterion.exitMode = currentCriterion.exitMode
                  ? [...currentCriterion.exitMode, ...newExitModesIds]
                  : newExitModesIds
                break
              }
              case ENCOUNTER_PRISENCHARGETYPE: {
                const priseEnChargeTypesIds = value?.split(',')
                const newPriseEnChargeTypesIds = priseEnChargeTypesIds?.map((priseEnChargeTypeId) => ({
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
                const newTypeDeSejoursIds = typeDeSejoursIds?.map((typeDeSejourId) => ({
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
                const newFileStatusIds = fileStatusIds?.map((fileStatusId) => ({
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
                const newDischargeIds = dischargeIds?.map((dischargeId) => ({
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
                const newAdmissionModeIds = admissionModeIds?.map((admissionModeId) => ({
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
                const newDestinationIds = destinationIds?.map((destinationId) => ({
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
                const newProvenanceIds = provenanceIds?.map((provenanceId) => ({
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
                const newAdmissionIds = admissionIds?.map((admissionId) => ({
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
                currentCriterion.searchBy = SearchByTypes.DESCRIPTION
                break
              case COMPOSITION_TEXT: {
                currentCriterion.search = value ? decodeURIComponent(value) : ''
                currentCriterion.searchBy = SearchByTypes.TEXT
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
      case RessourceType.CONDITION: {
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
              case CONDITION_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId) => {
                  const codeIdParts = codeId.split('|')
                  if (codeIdParts.length > 1) {
                    return { id: codeIdParts[1] }
                  }
                  return { id: codeIdParts[0] }
                })
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case CONDITION_TYPE: {
                const diagnosticTypeIds = value?.split(',')
                const newDiagnosticType = diagnosticTypeIds?.map((diagnosticTypeId) => ({ id: diagnosticTypeId }))
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
      case RessourceType.PROCEDURE: {
        currentCriterion.title = "Critères d'actes CCAM"
        currentCriterion.code = currentCriterion.code ? currentCriterion.code : []
        currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : []
        currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
        currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
        currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null
        currentCriterion.source = currentCriterion.source ? currentCriterion.source : null

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
              case PROCEDURE_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId) => {
                  const codeIdParts = codeId.split('|')
                  if (codeIdParts.length > 1) {
                    return { id: codeIdParts[1] }
                  }
                  return { id: codeIdParts[0] }
                })
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
              case CLAIM_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId) => {
                  const codeIdParts = codeId.split('|')
                  if (codeIdParts.length > 1) {
                    return { id: codeIdParts[1] }
                  }
                  return { id: codeIdParts[0] }
                })
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
              case MEDICATION_CODE: {
                const codeIds = value?.split(',').map((codeId) => {
                  codeId = codeId.split('|')[1]
                  return codeId
                })
                const newCode = codeIds?.map((codeId) => ({ id: codeId }))
                if (!newCode) continue

                currentCriterion.code = currentCriterion.code ? [...currentCriterion.code, ...newCode] : newCode
                break
              }
              case MEDICATION_PRESCRIPTION_TYPE: {
                const prescriptionTypeIds = value?.split(',')
                const newPrescription = prescriptionTypeIds?.map((prescriptionTypeId) => ({
                  id: prescriptionTypeId
                }))
                if (!newPrescription) continue

                currentCriterion.prescriptionType = currentCriterion.prescriptionType
                  ? [...currentCriterion.prescriptionType, ...newPrescription]
                  : newPrescription
                break
              }
              case MEDICATION_REQUEST_ROUTE:
              case MEDICATION_ADMINISTRATION_ROUTE: {
                const administrationIds = value?.split(',')
                const newAdministration = administrationIds?.map((administrationId) => ({ id: administrationId }))
                if (!newAdministration) continue

                currentCriterion.administration = currentCriterion.administration
                  ? [...currentCriterion.administration, ...newAdministration]
                  : newAdministration
                break
              }
              case 'subject.active':
                break
              case ENCOUNTER_CONTEXT_SERVICE_PROVIDER:
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
      case RessourceType.OBSERVATION: {
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
              case OBSERVATION_CODE: {
                const codeIds = value?.split(',')
                const newCode = codeIds?.map((codeId) => {
                  const codeIdParts = codeId.split('|')
                  if (codeIdParts.length > 1) {
                    return { id: codeIdParts[1] }
                  }
                  return { id: codeIdParts[0] }
                })
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

          for (const filter of filters) {
            const key = filter[0]
            const value = filter[1]
            switch (key) {
              case IMAGING_STUDY_DATE: {
                if (value.includes('ge')) {
                  currentCriterion.studyStartDate = value?.replace('T00:00:00Z', '').replace('ge', '')
                } else if (value.includes('le')) {
                  currentCriterion.studyEndDate = value?.replace('T00:00:00Z', '').replace('le', '')
                }
                break
              }
              case IMAGING_STUDY_MODALITIES: {
                const modalitiesIds = value?.replace(/^[*|]+/, '').split(',')
                const newModalitiesIds = modalitiesIds?.map((modality) => ({ id: modality }))
                if (!newModalitiesIds) continue

                currentCriterion.studyModalities = currentCriterion.studyModalities
                  ? [...currentCriterion.studyModalities, ...newModalitiesIds]
                  : newModalitiesIds
                break
              }
              case IMAGING_STUDY_DESCRIPTION: {
                currentCriterion.studyDescription = value ? decodeURIComponent(value) : ''
                break
              }
              case IMAGING_STUDY_PROCEDURE: {
                currentCriterion.studyProcedure = value ? decodeURIComponent(value) : ''
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
                  currentCriterion.seriesStartDate = value?.replace('T00:00:00Z', '').replace('ge', '')
                } else if (value.includes('le')) {
                  currentCriterion.seriesEndDate = value?.replace('T00:00:00Z', '').replace('le', '')
                }
                break
              }
              case IMAGING_SERIES_DESCRIPTION: {
                currentCriterion.seriesDescription = value ? decodeURIComponent(value) : ''
                break
              }
              case IMAGING_SERIES_PROTOCOL: {
                currentCriterion.seriesProtocol = value ? decodeURIComponent(value) : ''
                break
              }
              case IMAGING_SERIES_MODALITIES: {
                const modalitiesIds = value?.replace(/^[*|]+/, '').split(',')
                const newModalitiesIds = modalitiesIds?.map((modality) => ({ id: modality }))
                if (!newModalitiesIds) continue

                currentCriterion.seriesModalities = currentCriterion.seriesModalities
                  ? [...currentCriterion.seriesModalities, ...newModalitiesIds]
                  : newModalitiesIds
                break
              }
              case IMAGING_SERIES_UID: {
                currentCriterion.seriesUid = value ?? ''
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
            }
          }

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
            title: 'Groupe de critères',
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
