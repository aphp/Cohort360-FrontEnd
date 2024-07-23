/* eslint-disable @typescript-eslint/no-explicit-any */
import services from 'services/aphp'
import {
  CriteriaGroup,
  TemporalConstraintsType,
  CriteriaItemType,
  CriteriaItemDataCache,
  BiologyStatus,
  CriteriaGroupType,
  ScopeElement
} from 'types'

import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  MEDICATION_ATC,
  IMAGING_STUDY_UID_URL,
  PROCEDURE_HIERARCHY,
  DOC_STATUS_CODE_SYSTEM
} from '../constants'
import {
  DocumentAttachmentMethod,
  DocumentStatuses,
  FormNames,
  FilterByDocumentStatus,
  LabelObject,
  SearchByTypes,
  DurationRangeType
} from 'types/searchCriterias'
import {
  Comparators,
  CriteriaType,
  SelectedCriteriaType,
  CriteriaDataKey,
  DemographicDataType,
  CommonCriteriaDataType,
  ResourceType,
  EncounterDataType,
  DocumentDataType,
  Cim10DataType,
  PregnancyDataType,
  ImagingDataType,
  IPPListDataType,
  ObservationDataType,
  MedicationDataType,
  GhmDataType,
  CcamDataType,
  HospitDataType
} from 'types/requestCriterias'
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
  unbuildOccurrence,
  unbuildDateFilter,
  unbuildDurationFilter,
  unbuildDocTypesFilter,
  unbuildEncounterServiceCriterias,
  unbuildLabelObjectFilter,
  unbuildObservationValueFilter,
  unbuildSearchFilter,
  buildEncounterServiceFilter,
  filtersBuilders,
  unbuildDocStatusesFilter,
  questionnaireFiltersBuilders,
  unbuildQuestionnaireFilters,
  findQuestionnaireName,
  buildEncounterDateFilter,
  getCriterionDateFilterName,
  unbuildEncounterDatesFilters
} from './mappers'
import { pregnancyForm } from 'data/pregnancyData'
import { hospitForm } from 'data/hospitData'
import { editAllCriteria, editAllCriteriaGroup, pseudonimizeCriteria, buildCohortCreation } from 'state/cohortCreation'
import { AppDispatch } from 'state'
import { Hierarchy } from 'types/hierarchy'
import {
  AdministrationParamsKeys,
  ClaimParamsKeys,
  ConditionParamsKeys,
  DocumentsParamsKeys,
  EncounterParamsKeys,
  ImagingParamsKeys,
  IppParamsKeys,
  ObservationParamsKeys,
  PatientsParamsKeys,
  PrescriptionParamsKeys,
  ProcedureParamsKeys,
  QuestionnaireResponseParamsKeys
} from 'mappers/filters'

const REQUETEUR_VERSION = 'v1.4.5'

export const STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE = 'Structure hospitalière de prise en charge'

const DEFAULT_CRITERIA_ERROR: SelectedCriteriaType = {
  id: 0,
  isInclusive: false,
  type: CriteriaType.PATIENT,
  title: '',
  genders: [],
  vitalStatus: [],
  birthdates: [null, null],
  deathDates: [null, null],
  age: [null, null]
}

const DEFAULT_GROUP_ERROR: CriteriaGroup = {
  id: 0,
  title: '',
  type: CriteriaGroupType.AND_GROUP,
  criteriaIds: []
}

export type RequeteurCriteriaType = {
  // CRITERIA
  _type: string
  _id: number
  name: string
  isInclusive: boolean
  resourceType: ResourceType
  filterFhir: string
  occurrence?: {
    n?: number | null
    operator?: Comparators
    timeDelayMin?: number
    timeDelayMax?: number
  }
}

type RequeteurGroupType =
  | {
      // GROUP (andGroup | orGroup)
      _type: CriteriaGroupType.AND_GROUP | CriteriaGroupType.OR_GROUP
      _id: number
      isInclusive: boolean
      criteria: (RequeteurCriteriaType | RequeteurGroupType)[]
      temporalConstraints?: TemporalConstraintsType[]
    }
  // NOT IMPLEMENTED
  | {
      // GROUP (nAmongM)
      _type: CriteriaGroupType.N_AMONG_M
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
    caresiteCohortList?: string[]
    providerCohortList?: string[]
  }
  request: RequeteurGroupType | undefined
}

export const checkNominativeCriteria = (selectedCriteria: SelectedCriteriaType[]) => {
  const regex = /^[^0/][^/]*\/.*/
  // matches if the value before the first / isn't 0

  const isPatientWithDates = selectedCriteria.some(
    (criterion) =>
      criterion.type === CriteriaType.PATIENT &&
      (criterion.birthdates[0] !== null ||
        criterion.birthdates[1] !== null ||
        criterion.deathDates[0] !== null ||
        criterion.deathDates[1] !== null)
  )

  const isEncounterWithAgesInDays = selectedCriteria.some(
    (criterion) =>
      (criterion.type === CriteriaType.ENCOUNTER || criterion.type === CriteriaType.PATIENT) &&
      (criterion.age?.[0]?.match(regex) || criterion.age?.[1]?.match(regex))
  )

  const isSensitiveCriteria = selectedCriteria.some(
    (criterion) =>
      criterion.type === CriteriaType.IPP_LIST ||
      criterion.type === CriteriaType.PREGNANCY ||
      criterion.type === CriteriaType.HOSPIT
  )

  return isPatientWithDates || isEncounterWithAgesInDays || isSensitiveCriteria
}

export const cleanNominativeCriterias = (
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroups: CriteriaGroup[],
  dispatch: AppDispatch,
  selectedPopulation?: ScopeElement[]
) => {
  const cleanDurationRange = (value: DurationRangeType) => {
    const regex = /^[^/]*\// // matches everything before the first '/'

    const cleanValue = (value: string | null | undefined) =>
      value ? (value.replace(regex, '0/') === '0/0/0' ? null : value.replace(regex, '0/')) : null

    return [cleanValue(value[0]), cleanValue(value[1])] as DurationRangeType
  }

  const cleanedSelectedCriteria = selectedCriteria
    .filter(
      (criteria) =>
        criteria.type !== CriteriaType.IPP_LIST &&
        criteria.type !== CriteriaType.PREGNANCY &&
        criteria.type !== CriteriaType.HOSPIT
    )
    .map((criterion) => {
      switch (criterion.type) {
        case CriteriaType.PATIENT: {
          return {
            ...criterion,
            birthdates: [null, null] as DurationRangeType,
            deathDates: [null, null] as DurationRangeType,
            age: cleanDurationRange(criterion.age)
          }
        }
        case CriteriaType.ENCOUNTER: {
          return {
            ...criterion,
            age: cleanDurationRange(criterion.age)
          }
        }
        default:
          return criterion
      }
    })

  const cleanedCriteriasIds = cleanedSelectedCriteria.map((criterion) => criterion.id)
  const cleanedGroups = criteriaGroups.map((group) => {
    return {
      ...group,
      criteriaIds: group.criteriaIds.filter((id) => cleanedCriteriasIds.includes(id))
    }
  })
  dispatch(editAllCriteriaGroup(cleanedGroups))
  dispatch(editAllCriteria(cleanedSelectedCriteria))
  dispatch(pseudonimizeCriteria())
  if (selectedPopulation != undefined && selectedPopulation.length > 0) {
    dispatch(buildCohortCreation({ selectedPopulation: selectedPopulation }))
  } else {
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }
}

const constructFilterFhir = (criterion: SelectedCriteriaType, deidentified: boolean): string => {
  let filterFhir = ''
  const filterReducer = (accumulator: string, currentValue: string): string =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

  const joinDocStatuses = (docStatuses: string[]): string => {
    const filterDocStatuses: string[] = []
    for (const _status of docStatuses) {
      const status =
        _status === FilterByDocumentStatus.VALIDATED
          ? DocumentStatuses.FINAL
          : _status === FilterByDocumentStatus.NOT_VALIDATED
          ? DocumentStatuses.PRELIMINARY
          : ''
      filterDocStatuses.push(`${DOC_STATUS_CODE_SYSTEM}|${status}`)
    }
    return filterDocStatuses.join(',')
  }

  switch (criterion.type) {
    case CriteriaType.PATIENT: {
      filterFhir = [
        'active=true',
        filtersBuilders(PatientsParamsKeys.GENDERS, buildLabelObjectFilter(criterion.genders)),
        filtersBuilders(PatientsParamsKeys.VITAL_STATUS, buildLabelObjectFilter(criterion.vitalStatus)),
        filtersBuilders(PatientsParamsKeys.BIRTHDATE, buildDateFilter(criterion.birthdates[1], 'le')),
        filtersBuilders(PatientsParamsKeys.BIRTHDATE, buildDateFilter(criterion.birthdates[0], 'ge')),
        filtersBuilders(PatientsParamsKeys.DEATHDATE, buildDateFilter(criterion.deathDates[0], 'ge')),
        filtersBuilders(PatientsParamsKeys.DEATHDATE, buildDateFilter(criterion.deathDates[1], 'le')),
        criterion.birthdates[0] === null && criterion.birthdates[1] === null
          ? buildDurationFilter(
              criterion.age[0],
              deidentified ? PatientsParamsKeys.DATE_DEIDENTIFIED : PatientsParamsKeys.DATE_IDENTIFIED,
              'ge',
              deidentified
            )
          : '',
        criterion.birthdates[1] === null && criterion.birthdates[1] === null
          ? buildDurationFilter(
              criterion.age[1],
              deidentified ? PatientsParamsKeys.DATE_DEIDENTIFIED : PatientsParamsKeys.DATE_IDENTIFIED,
              'le',
              deidentified
            )
          : ''
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case CriteriaType.ENCOUNTER: {
      filterFhir = [
        'subject.active=true',
        filtersBuilders(EncounterParamsKeys.ADMISSIONMODE, buildLabelObjectFilter(criterion.admissionMode)),
        filtersBuilders(EncounterParamsKeys.ENTRYMODE, buildLabelObjectFilter(criterion.entryMode)),
        filtersBuilders(EncounterParamsKeys.EXITMODE, buildLabelObjectFilter(criterion.exitMode)),
        filtersBuilders(EncounterParamsKeys.PRISENCHARGETYPE, buildLabelObjectFilter(criterion.priseEnChargeType)),
        filtersBuilders(EncounterParamsKeys.TYPEDESEJOUR, buildLabelObjectFilter(criterion.typeDeSejour)),
        filtersBuilders(EncounterParamsKeys.DESTINATION, buildLabelObjectFilter(criterion.destination)),
        filtersBuilders(EncounterParamsKeys.PROVENANCE, buildLabelObjectFilter(criterion.provenance)),
        filtersBuilders(EncounterParamsKeys.ADMISSION, buildLabelObjectFilter(criterion.admission)),
        filtersBuilders(EncounterParamsKeys.REASON, buildLabelObjectFilter(criterion.reason)),
        filtersBuilders(EncounterParamsKeys.SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(EncounterParamsKeys.STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        criterion.duration[0] !== null
          ? buildDurationFilter(criterion?.duration?.[0], EncounterParamsKeys.DURATION, 'ge')
          : '',
        criterion.duration[1] !== null
          ? buildDurationFilter(criterion?.duration?.[1], EncounterParamsKeys.DURATION, 'le')
          : '',
        criterion.age[0] !== null
          ? buildDurationFilter(
              criterion?.age[0],
              deidentified ? EncounterParamsKeys.MIN_BIRTHDATE_MONTH : EncounterParamsKeys.MIN_BIRTHDATE_DAY,
              'ge',
              deidentified
            )
          : '',
        criterion.age[1] !== null
          ? buildDurationFilter(
              criterion?.age[1],
              deidentified ? EncounterParamsKeys.MAX_BIRTHDATE_MONTH : EncounterParamsKeys.MAX_BIRTHDATE_DAY,
              'le',
              deidentified
            )
          : '',
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case CriteriaType.DOCUMENTS: {
      const unreducedFilterFhir = [
        `type:not=doc-impor&contenttype=text/plain&subject.active=true`,
        filtersBuilders(DocumentsParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(
          criterion.searchBy === SearchByTypes.TEXT ? SearchByTypes.TEXT : SearchByTypes.DESCRIPTION,
          buildSearchFilter(criterion.search)
        ),
        filtersBuilders(DocumentsParamsKeys.DOC_STATUSES, joinDocStatuses(criterion.docStatuses)),
        filtersBuilders(
          DocumentsParamsKeys.DOC_TYPES,
          buildLabelObjectFilter(
            criterion.docType?.map((docType) => {
              return {
                id: docType.code
              } as LabelObject
            })
          )
        ),
        filtersBuilders(DocumentsParamsKeys.DOC_STATUSES, buildLabelObjectFilter(criterion.encounterStatus)),
        filtersBuilders(DocumentsParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
        filtersBuilders(DocumentsParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.CONDITION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(ConditionParamsKeys.CODE, buildLabelObjectFilter(criterion.code, CONDITION_HIERARCHY)),
        filtersBuilders(ConditionParamsKeys.DIAGNOSTIC_TYPES, buildLabelObjectFilter(criterion.diagnosticType)),
        criterion.source ? buildSimpleFilter(criterion.source, ProcedureParamsKeys.SOURCE) : '',
        filtersBuilders(ConditionParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(ConditionParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        filtersBuilders(ConditionParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
        filtersBuilders(ConditionParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.PROCEDURE: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(ProcedureParamsKeys.CODE, buildLabelObjectFilter(criterion.code, PROCEDURE_HIERARCHY)),
        filtersBuilders(ProcedureParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(ProcedureParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        filtersBuilders(ProcedureParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
        filtersBuilders(ProcedureParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
        criterion.source ? buildSimpleFilter(criterion.source, ProcedureParamsKeys.SOURCE) : '',
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.CLAIM: {
      const unreducedFilterFhir = [
        'patient.active=true',
        filtersBuilders(ClaimParamsKeys.CODE, buildLabelObjectFilter(criterion.code, CLAIM_HIERARCHY)),
        filtersBuilders(ClaimParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(ClaimParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        filtersBuilders(ClaimParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
        filtersBuilders(ClaimParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.MEDICATION_REQUEST:
    case CriteriaType.MEDICATION_ADMINISTRATION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(
          criterion.type === CriteriaType.MEDICATION_REQUEST
            ? PrescriptionParamsKeys.PRESCRIPTION_ROUTES
            : AdministrationParamsKeys.ADMINISTRATION_ROUTES,
          buildLabelObjectFilter(criterion.administration)
        ),
        filtersBuilders(
          criterion.type === CriteriaType.MEDICATION_REQUEST
            ? PrescriptionParamsKeys.EXECUTIVE_UNITS
            : AdministrationParamsKeys.EXECUTIVE_UNITS,
          buildEncounterServiceFilter(criterion.encounterService)
        ),
        filtersBuilders(PrescriptionParamsKeys.CODE, buildLabelObjectFilter(criterion.code, MEDICATION_ATC, true)),
        filtersBuilders(
          criterion.type === CriteriaType.MEDICATION_REQUEST
            ? PrescriptionParamsKeys.ENCOUNTER_STATUS
            : AdministrationParamsKeys.ENCOUNTER_STATUS,
          buildLabelObjectFilter(criterion.encounterStatus)
        ),
        filtersBuilders(
          criterion.type === CriteriaType.MEDICATION_REQUEST
            ? PrescriptionParamsKeys.DATE
            : AdministrationParamsKeys.DATE,
          buildDateFilter(criterion.startOccurrence[0], 'ge')
        ),
        filtersBuilders(
          criterion.type === CriteriaType.MEDICATION_REQUEST
            ? PrescriptionParamsKeys.DATE
            : AdministrationParamsKeys.DATE,
          buildDateFilter(criterion.startOccurrence[1], 'le')
        ),
        filtersBuilders(PrescriptionParamsKeys.END_DATE, buildDateFilter(criterion.endOccurrence?.[0], 'ge')),
        filtersBuilders(PrescriptionParamsKeys.END_DATE, buildDateFilter(criterion.endOccurrence?.[1], 'le')),
        criterion.type === CriteriaType.MEDICATION_REQUEST
          ? filtersBuilders(
              PrescriptionParamsKeys.PRESCRIPTION_TYPES,
              buildLabelObjectFilter(criterion.prescriptionType)
            )
          : '',
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.OBSERVATION: {
      const unreducedFilterFhir = [
        `subject.active=true&${ObservationParamsKeys.VALIDATED_STATUS}=${BiologyStatus.VALIDATED}`,
        filtersBuilders(
          ObservationParamsKeys.ANABIO_LOINC,
          buildLabelObjectFilter(criterion.code, BIOLOGY_HIERARCHY_ITM_ANABIO)
        ),
        filtersBuilders(ObservationParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(ObservationParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        filtersBuilders(ObservationParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
        filtersBuilders(ObservationParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
        buildObservationValueFilter(criterion, ObservationParamsKeys.VALUE),
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.IPP_LIST: {
      const unreducedFilterFhir = [
        `${criterion.search ? `${IppParamsKeys.IPP_LIST_FHIR}=${criterion.search}` : ''}`
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case CriteriaType.IMAGING: {
      filterFhir = [
        'patient.active=true',
        filtersBuilders(ImagingParamsKeys.DATE, buildDateFilter(criterion.studyStartDate, 'ge')),
        filtersBuilders(ImagingParamsKeys.DATE, buildDateFilter(criterion.studyEndDate, 'le')),
        filtersBuilders(ImagingParamsKeys.SERIES_DATE, buildDateFilter(criterion.seriesStartDate, 'ge')),
        filtersBuilders(ImagingParamsKeys.SERIES_DATE, buildDateFilter(criterion.seriesEndDate, 'le')),
        filtersBuilders(ImagingParamsKeys.STUDY_DESCRIPTION, buildSearchFilter(criterion.studyDescription)),
        filtersBuilders(ImagingParamsKeys.STUDY_PROCEDURE, buildSearchFilter(criterion.studyProcedure)),
        filtersBuilders(ImagingParamsKeys.SERIES_DESCRIPTION, buildSearchFilter(criterion.seriesDescription)),
        filtersBuilders(ImagingParamsKeys.SERIES_PROTOCOL, buildSearchFilter(criterion.seriesProtocol)),
        filtersBuilders(ImagingParamsKeys.MODALITY, buildLabelObjectFilter(criterion.studyModalities)),
        filtersBuilders(ImagingParamsKeys.SERIES_MODALITIES, buildLabelObjectFilter(criterion.seriesModalities)),
        filtersBuilders(ImagingParamsKeys.EXECUTIVE_UNITS, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(
          ImagingParamsKeys.NB_OF_SERIES,
          buildComparatorFilter(criterion.numberOfSeries, criterion.seriesComparator)
        ),
        filtersBuilders(
          ImagingParamsKeys.NB_OF_INS,
          buildComparatorFilter(criterion.numberOfIns, criterion.instancesComparator)
        ),
        filtersBuilders(ImagingParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
        buildWithDocumentFilter(criterion, ImagingParamsKeys.WITH_DOCUMENT),
        buildSimpleFilter(criterion.studyUid, ImagingParamsKeys.STUDY_UID, IMAGING_STUDY_UID_URL),
        buildSimpleFilter(criterion.seriesUid, ImagingParamsKeys.SERIES_UID),
        buildEncounterDateFilter(
          criterion.type,
          criterion.includeEncounterStartDateNull,
          criterion.encounterStartDate,
          true
        ),
        buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case CriteriaType.PREGNANCY:
      filterFhir = [
        'subject.active=true',
        `questionnaire.name=${FormNames.PREGNANCY}`,
        'status=in-progress,completed',
        filtersBuilders(
          QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS,
          buildLabelObjectFilter(criterion.encounterStatus)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.pregnancyStartDate,
          buildDateFilter(criterion.pregnancyStartDate, 'ge', true)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.pregnancyEndDate,
          buildDateFilter(criterion.pregnancyEndDate, 'le', true)
        ),
        questionnaireFiltersBuilders(pregnancyForm.pregnancyMode, buildLabelObjectFilter(criterion.pregnancyMode)),
        questionnaireFiltersBuilders(
          pregnancyForm.foetus,
          buildComparatorFilter(criterion.foetus, criterion.foetusComparator)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.parity,
          buildComparatorFilter(criterion.parity, criterion.parityComparator)
        ),
        questionnaireFiltersBuilders(pregnancyForm.maternalRisks, buildLabelObjectFilter(criterion.maternalRisks)),
        questionnaireFiltersBuilders(
          pregnancyForm.maternalRisksPrecision,
          buildSearchFilter(criterion.maternalRisksPrecision)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.risksRelatedToObstetricHistory,
          buildLabelObjectFilter(criterion.risksRelatedToObstetricHistory)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.risksRelatedToObstetricHistoryPrecision,
          buildSearchFilter(criterion.risksRelatedToObstetricHistoryPrecision)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.risksOrComplicationsOfPregnancy,
          buildLabelObjectFilter(criterion.risksOrComplicationsOfPregnancy)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.risksOrComplicationsOfPregnancyPrecision,
          buildSearchFilter(criterion.risksOrComplicationsOfPregnancyPrecision)
        ),
        questionnaireFiltersBuilders(pregnancyForm.corticotherapie, buildLabelObjectFilter(criterion.corticotherapie)),
        questionnaireFiltersBuilders(
          pregnancyForm.prenatalDiagnosis,
          buildLabelObjectFilter(criterion.prenatalDiagnosis)
        ),
        questionnaireFiltersBuilders(
          pregnancyForm.ultrasoundMonitoring,
          buildLabelObjectFilter(criterion.ultrasoundMonitoring)
        ),
        questionnaireFiltersBuilders(
          { id: QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS, type: 'valueCoding' },
          buildEncounterServiceFilter(criterion.encounterService)
        )
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    case CriteriaType.HOSPIT:
      filterFhir = [
        'subject.active=true',
        `questionnaire.name=${FormNames.HOSPIT}`,
        'status=in-progress,completed',
        filtersBuilders(
          QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS,
          buildLabelObjectFilter(criterion.encounterStatus)
        ),
        questionnaireFiltersBuilders(hospitForm.hospitReason, buildSearchFilter(criterion.hospitReason)),
        questionnaireFiltersBuilders(hospitForm.inUteroTransfer, buildLabelObjectFilter(criterion.inUteroTransfer)),
        questionnaireFiltersBuilders(
          hospitForm.pregnancyMonitoring,
          buildLabelObjectFilter(criterion.pregnancyMonitoring)
        ),
        questionnaireFiltersBuilders(hospitForm.vme, buildLabelObjectFilter(criterion.vme)),
        questionnaireFiltersBuilders(
          hospitForm.maturationCorticotherapie,
          buildLabelObjectFilter(criterion.maturationCorticotherapie)
        ),
        questionnaireFiltersBuilders(
          hospitForm.chirurgicalGesture,
          buildLabelObjectFilter(criterion.chirurgicalGesture)
        ),
        questionnaireFiltersBuilders(hospitForm.childbirth, buildLabelObjectFilter(criterion.childbirth)),
        questionnaireFiltersBuilders(
          hospitForm.hospitalChildBirthPlace,
          buildLabelObjectFilter(criterion.hospitalChildBirthPlace)
        ),
        questionnaireFiltersBuilders(
          hospitForm.otherHospitalChildBirthPlace,
          buildLabelObjectFilter(criterion.otherHospitalChildBirthPlace)
        ),
        questionnaireFiltersBuilders(
          hospitForm.homeChildBirthPlace,
          buildLabelObjectFilter(criterion.homeChildBirthPlace)
        ),
        questionnaireFiltersBuilders(hospitForm.childbirthMode, buildLabelObjectFilter(criterion.childbirthMode)),
        questionnaireFiltersBuilders(hospitForm.maturationReason, buildLabelObjectFilter(criterion.maturationReason)),
        questionnaireFiltersBuilders(
          hospitForm.maturationModality,
          buildLabelObjectFilter(criterion.maturationModality)
        ),
        questionnaireFiltersBuilders(hospitForm.imgIndication, buildLabelObjectFilter(criterion.imgIndication)),
        questionnaireFiltersBuilders(
          hospitForm.laborOrCesareanEntry,
          buildLabelObjectFilter(criterion.laborOrCesareanEntry)
        ),
        questionnaireFiltersBuilders(
          hospitForm.pathologyDuringLabor,
          buildLabelObjectFilter(criterion.pathologyDuringLabor)
        ),
        questionnaireFiltersBuilders(
          hospitForm.obstetricalGestureDuringLabor,
          buildLabelObjectFilter(criterion.obstetricalGestureDuringLabor)
        ),
        questionnaireFiltersBuilders(hospitForm.analgesieType, buildLabelObjectFilter(criterion.analgesieType)),
        questionnaireFiltersBuilders(
          hospitForm.birthDeliveryStartDate,
          buildDateFilter(criterion.birthDeliveryStartDate, 'ge', true)
        ),
        questionnaireFiltersBuilders(
          hospitForm.birthDeliveryEndDate,
          buildDateFilter(criterion.birthDeliveryEndDate, 'le', true)
        ),
        questionnaireFiltersBuilders(
          hospitForm.birthDeliveryWeeks,
          buildComparatorFilter(criterion.birthDeliveryWeeks, criterion.birthDeliveryWeeksComparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.birthDeliveryDays,
          buildComparatorFilter(criterion.birthDeliveryDays, criterion.birthDeliveryDaysComparator)
        ),
        questionnaireFiltersBuilders(hospitForm.birthDeliveryWay, buildLabelObjectFilter(criterion.birthDeliveryWay)),
        questionnaireFiltersBuilders(hospitForm.instrumentType, buildLabelObjectFilter(criterion.instrumentType)),
        questionnaireFiltersBuilders(hospitForm.cSectionModality, buildLabelObjectFilter(criterion.cSectionModality)),
        questionnaireFiltersBuilders(
          hospitForm.presentationAtDelivery,
          buildLabelObjectFilter(criterion.presentationAtDelivery)
        ),
        questionnaireFiltersBuilders(
          hospitForm.birthMensurationsGrams,
          buildComparatorFilter(criterion.birthMensurationsGrams, criterion.birthMensurationsGramsComparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.birthMensurationsPercentil,
          buildComparatorFilter(criterion.birthMensurationsPercentil, criterion.birthMensurationsPercentilComparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.apgar1,
          buildComparatorFilter(criterion.apgar1, criterion.apgar1Comparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.apgar3,
          buildComparatorFilter(criterion.apgar3, criterion.apgar3Comparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.apgar5,
          buildComparatorFilter(criterion.apgar5, criterion.apgar5Comparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.apgar10,
          buildComparatorFilter(criterion.apgar10, criterion.apgar10Comparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.arterialPhCord,
          buildComparatorFilter(criterion.arterialPhCord, criterion.arterialPhCordComparator)
        ),
        questionnaireFiltersBuilders(
          hospitForm.arterialCordLactates,
          buildComparatorFilter(criterion.arterialCordLactates, criterion.arterialCordLactatesComparator)
        ),
        questionnaireFiltersBuilders(hospitForm.birthStatus, buildLabelObjectFilter(criterion.birthStatus)),
        questionnaireFiltersBuilders(
          hospitForm.postpartumHemorrhage,
          buildLabelObjectFilter(criterion.postpartumHemorrhage)
        ),
        questionnaireFiltersBuilders(hospitForm.conditionPerineum, buildLabelObjectFilter(criterion.conditionPerineum)),
        questionnaireFiltersBuilders(hospitForm.exitPlaceType, buildLabelObjectFilter(criterion.exitPlaceType)),
        questionnaireFiltersBuilders(hospitForm.feedingType, buildLabelObjectFilter(criterion.feedingType)),
        questionnaireFiltersBuilders(hospitForm.complication, buildLabelObjectFilter(criterion.complication)),
        questionnaireFiltersBuilders(hospitForm.exitFeedingMode, buildLabelObjectFilter(criterion.exitFeedingMode)),
        questionnaireFiltersBuilders(hospitForm.exitDiagnostic, buildLabelObjectFilter(criterion.exitDiagnostic)),
        questionnaireFiltersBuilders(
          { id: QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS, type: 'valueCoding' },
          buildEncounterServiceFilter(criterion.encounterService)
        )
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break

    default:
      break
  }

  return filterFhir
}

const mapCriteriaToResource = (criteriaType: CriteriaType): ResourceType => {
  const mapping: { [key in CriteriaType]?: ResourceType } = {
    [CriteriaType.IPP_LIST]: ResourceType.IPP_LIST,
    [CriteriaType.PATIENT]: ResourceType.PATIENT,
    [CriteriaType.ENCOUNTER]: ResourceType.ENCOUNTER,
    [CriteriaType.DOCUMENTS]: ResourceType.DOCUMENTS,
    [CriteriaType.CONDITION]: ResourceType.CONDITION,
    [CriteriaType.PROCEDURE]: ResourceType.PROCEDURE,
    [CriteriaType.CLAIM]: ResourceType.CLAIM,
    [CriteriaType.MEDICATION_REQUEST]: ResourceType.MEDICATION_REQUEST,
    [CriteriaType.MEDICATION_ADMINISTRATION]: ResourceType.MEDICATION_ADMINISTRATION,
    [CriteriaType.OBSERVATION]: ResourceType.OBSERVATION,
    [CriteriaType.IMAGING]: ResourceType.IMAGING,
    [CriteriaType.QUESTIONNAIRE]: ResourceType.QUESTIONNAIRE,
    [CriteriaType.QUESTIONNAIRE_RESPONSE]: ResourceType.QUESTIONNAIRE_RESPONSE,
    [CriteriaType.PREGNANCY]: ResourceType.QUESTIONNAIRE_RESPONSE,
    [CriteriaType.HOSPIT]: ResourceType.QUESTIONNAIRE_RESPONSE
  }
  const resourceType = mapping[criteriaType]
  if (resourceType) return resourceType
  throw new Error('Unknown criteria type')
}

export function buildRequest(
  selectedPopulation: (Hierarchy<ScopeElement, string> | undefined)[] | null,
  selectedCriteria: SelectedCriteriaType[],
  criteriaGroup: CriteriaGroup[],
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
          name: item.title,
          isInclusive: item.isInclusive ?? true,
          resourceType: mapCriteriaToResource(item.type),
          filterFhir: constructFilterFhir(item, deidentified),
          occurrence: !(item.type === CriteriaType.PATIENT || item.type === CriteriaType.IPP_LIST)
            ? {
                n: item.occurrence,
                operator: item?.occurrenceComparator || undefined
              }
            : undefined
        }
      } else {
        // return RequeteurGroupType
        const group: CriteriaGroup = criteriaGroup.find(({ id }) => id === itemId) ?? DEFAULT_GROUP_ERROR

        // DO SPECIAL THING FOR `NamongM`
        if (group.type === CriteriaGroupType.N_AMONG_M) {
          child = {
            _type: CriteriaGroupType.N_AMONG_M,
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
        ?.map((_selectedPopulation) => _selectedPopulation?.cohort_id)
        .filter((item): item is string => !!item && item !== 'loading')
    },
    request: !mainCriteriaGroups
      ? undefined
      : {
          _id: 0,
          _type:
            mainCriteriaGroups.type === CriteriaGroupType.OR_GROUP
              ? CriteriaGroupType.OR_GROUP
              : CriteriaGroupType.AND_GROUP,
          isInclusive: !!mainCriteriaGroups.isInclusive,
          criteria: exploreCriteriaGroup(mainCriteriaGroups.criteriaIds),
          temporalConstraints: temporalConstraints.filter(({ constraintType }) => constraintType !== 'none')
        }
  }

  return JSON.stringify(json)
}

const unbuildCommonCriteria = (element: RequeteurCriteriaType): Omit<CommonCriteriaDataType, 'type'> => {
  return {
    id: element._id,
    isInclusive: element.isInclusive,
    title: ''
  }
}

const unbuildPatientCriteria = (element: RequeteurCriteriaType): DemographicDataType => {
  const currentCriterion: DemographicDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.PATIENT,
    title: element.name ?? 'Critère démographique',
    genders: [],
    vitalStatus: [],
    age: [null, null],
    birthdates: [null, null],
    deathDates: [null, null]
  }
  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null

      switch (key) {
        case PatientsParamsKeys.DATE_IDENTIFIED:
        case PatientsParamsKeys.DATE_DEIDENTIFIED: {
          if (value?.includes('ge')) {
            currentCriterion.age[0] = unbuildDurationFilter(
              value,
              key === PatientsParamsKeys.DATE_DEIDENTIFIED ? true : false
            )
          } else if (value?.includes('le')) {
            currentCriterion.age[1] = unbuildDurationFilter(
              value,
              key === PatientsParamsKeys.DATE_DEIDENTIFIED ? true : false
            )
          }
          break
        }
        case PatientsParamsKeys.BIRTHDATE: {
          if (value?.includes('ge')) {
            currentCriterion.birthdates[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.birthdates[1] = unbuildDateFilter(value)
          }
          break
        }
        case PatientsParamsKeys.DEATHDATE: {
          if (value?.includes('ge')) {
            currentCriterion.deathDates[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.deathDates[1] = unbuildDateFilter(value)
          }
          break
        }
        case PatientsParamsKeys.GENDERS: {
          unbuildLabelObjectFilter(currentCriterion, 'genders', value)
          break
        }
        case PatientsParamsKeys.VITAL_STATUS: {
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
  return currentCriterion
}

const unbuildEncounterCriteria = async (element: RequeteurCriteriaType): Promise<EncounterDataType> => {
  const currentCriterion: EncounterDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.ENCOUNTER,
    title: element.name ?? 'Critère de prise en charge',
    duration: [null, null],
    age: [null, null],
    admissionMode: [],
    entryMode: [],
    exitMode: [],
    priseEnChargeType: [],
    typeDeSejour: [],
    reason: [],
    destination: [],
    provenance: [],
    admission: [],
    encounterService: [],
    occurrence: null,
    startOccurrence: [null, null],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null],
    encounterStatus: []
  }
  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    unbuildOccurrence(element, currentCriterion)

    for (const filter of filters) {
      const key = filter[0]
      const value = filter[1]
      switch (key) {
        case EncounterParamsKeys.DURATION: {
          if (value.includes('ge')) {
            currentCriterion.duration[0] = unbuildDurationFilter(value)
          } else if (value.includes('le')) {
            currentCriterion.duration[1] = unbuildDurationFilter(value)
          }
          break
        }
        case EncounterParamsKeys.MIN_BIRTHDATE_DAY:
        case EncounterParamsKeys.MIN_BIRTHDATE_MONTH: {
          currentCriterion.age[0] = unbuildDurationFilter(
            value,
            key === EncounterParamsKeys.MIN_BIRTHDATE_MONTH ? true : false
          )
          break
        }
        case EncounterParamsKeys.MAX_BIRTHDATE_DAY:
        case EncounterParamsKeys.MAX_BIRTHDATE_MONTH: {
          currentCriterion.age[1] = unbuildDurationFilter(
            value,
            key === EncounterParamsKeys.MAX_BIRTHDATE_MONTH ? true : false
          )
          break
        }
        case EncounterParamsKeys.ENTRYMODE: {
          unbuildLabelObjectFilter(currentCriterion, 'entryMode', value)
          break
        }
        case EncounterParamsKeys.EXITMODE: {
          unbuildLabelObjectFilter(currentCriterion, 'exitMode', value)
          break
        }
        case EncounterParamsKeys.PRISENCHARGETYPE: {
          unbuildLabelObjectFilter(currentCriterion, 'priseEnChargeType', value)
          break
        }
        case EncounterParamsKeys.TYPEDESEJOUR: {
          unbuildLabelObjectFilter(currentCriterion, 'typeDeSejour', value)
          break
        }
        case EncounterParamsKeys.REASON: {
          unbuildLabelObjectFilter(currentCriterion, 'reason', value)
          break
        }
        case EncounterParamsKeys.ADMISSIONMODE: {
          unbuildLabelObjectFilter(currentCriterion, 'admissionMode', value)
          break
        }
        case EncounterParamsKeys.DESTINATION: {
          unbuildLabelObjectFilter(currentCriterion, 'destination', value)
          break
        }
        case EncounterParamsKeys.PROVENANCE: {
          unbuildLabelObjectFilter(currentCriterion, 'provenance', value)
          break
        }
        case EncounterParamsKeys.ADMISSION: {
          unbuildLabelObjectFilter(currentCriterion, 'admission', value)
          break
        }
        case EncounterParamsKeys.SERVICE_PROVIDER: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case EncounterParamsKeys.STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case EncounterParamsKeys.START_DATE: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case EncounterParamsKeys.END_DATE: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
        case 'subject.active':
          break
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}

const unbuildDocumentReferenceCriteria = async (element: RequeteurCriteriaType): Promise<DocumentDataType> => {
  const currentCriterion: DocumentDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.DOCUMENTS,
    title: element.name ?? 'Critère de document',
    search: '',
    searchBy: SearchByTypes.TEXT,
    docType: [],
    docStatuses: [],
    occurrence: null,
    occurrenceComparator: null,
    startOccurrence: [null, null],
    encounterService: [],
    encounterEndDate: [null, null],
    encounterStartDate: [null, null],
    encounterStatus: []
  }

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null
      switch (key) {
        case SearchByTypes.DESCRIPTION:
          currentCriterion.search = unbuildSearchFilter(value)
          currentCriterion.searchBy = SearchByTypes.DESCRIPTION
          break
        case SearchByTypes.TEXT: {
          currentCriterion.search = unbuildSearchFilter(value)
          currentCriterion.searchBy = SearchByTypes.TEXT
          break
        }
        case DocumentsParamsKeys.DOC_TYPES: {
          unbuildDocTypesFilter(currentCriterion, 'docType', value)
          break
        }
        case DocumentsParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case DocumentsParamsKeys.DOC_STATUSES:
          unbuildDocStatusesFilter(currentCriterion, 'docStatuses', value)
          break
        case DocumentsParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case DocumentsParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.DOCUMENTS)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.DOCUMENTS)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
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
  return currentCriterion
}

const unbuildConditionCriteria = async (element: RequeteurCriteriaType): Promise<Cim10DataType> => {
  const currentCriterion: Cim10DataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.CONDITION,
    title: element.name ?? 'Critère de diagnostic',
    code: [],
    source: null,
    diagnosticType: [],
    occurrence: null,
    startOccurrence: [null, null],
    encounterService: [],
    encounterEndDate: [null, null],
    encounterStartDate: [null, null],
    occurrenceComparator: null,
    label: undefined,
    encounterStatus: []
  }

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null
      switch (key) {
        case ConditionParamsKeys.CODE: {
          unbuildLabelObjectFilter(currentCriterion, 'code', value)
          break
        }
        case ConditionParamsKeys.SOURCE: {
          currentCriterion.source = value
          break
        }
        case ConditionParamsKeys.DIAGNOSTIC_TYPES: {
          unbuildLabelObjectFilter(currentCriterion, 'diagnosticType', value)
          break
        }
        case ConditionParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case ConditionParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case ConditionParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.CONDITION)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.CONDITION)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter': {
          unbuildEncounterDatesFilters(currentCriterion, value)
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
  return currentCriterion
}
const unbuildProcedureCriteria = async (element: RequeteurCriteriaType): Promise<CcamDataType> => {
  const currentCriterion: CcamDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.PROCEDURE,
    title: element.name ?? "Critères d'actes CCAM",
    code: [],
    occurrence: null,
    startOccurrence: [null, null],
    source: null,
    label: undefined,
    hierarchy: undefined,
    encounterService: [],
    occurrenceComparator: null,
    encounterStatus: [],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null]
  }

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null
      switch (key) {
        case ProcedureParamsKeys.CODE: {
          unbuildLabelObjectFilter(currentCriterion, 'code', value)
          break
        }
        case ProcedureParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case 'subject.active':
          break
        case ProcedureParamsKeys.SOURCE: {
          currentCriterion.source = value
          break
        }
        case ProcedureParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case ProcedureParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.PROCEDURE)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.PROCEDURE)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}

const unbuildClaimCriteria = async (element: RequeteurCriteriaType): Promise<GhmDataType> => {
  const currentCriterion: GhmDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.CLAIM,
    title: element.name ?? 'Critère de GHM',
    code: [],
    occurrence: null,
    startOccurrence: [null, null],
    encounterService: [],
    label: undefined,
    encounterStatus: [],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null]
  }

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null
      switch (key) {
        case ClaimParamsKeys.CODE: {
          unbuildLabelObjectFilter(currentCriterion, 'code', value)
          break
        }
        case ClaimParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case ClaimParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case ClaimParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.CLAIM)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.CLAIM)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
        case 'patient.active':
          break
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}
const unbuildMedicationCriteria = async (element: RequeteurCriteriaType): Promise<MedicationDataType> => {
  const currentCriterion: MedicationDataType = {
    ...unbuildCommonCriteria(element),
    title: element.name ?? 'Critère de médicament',
    type:
      element.resourceType === ResourceType.MEDICATION_REQUEST
        ? CriteriaType.MEDICATION_REQUEST
        : CriteriaType.MEDICATION_ADMINISTRATION,
    code: [],
    prescriptionType: [],
    administration: [],
    occurrence: null,
    startOccurrence: [null, null],
    endOccurrence: [null, null],
    encounterService: [],
    encounterStatus: [],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null]
  }

  unbuildOccurrence(element, currentCriterion)
  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null
      switch (key) {
        case PrescriptionParamsKeys.CODE: {
          const codeIds = value?.replace(/https:\/\/.*?\|/g, '')
          unbuildLabelObjectFilter(currentCriterion, 'code', codeIds)
          break
        }
        case PrescriptionParamsKeys.PRESCRIPTION_TYPES: {
          unbuildLabelObjectFilter(currentCriterion, 'prescriptionType', value)
          break
        }
        case PrescriptionParamsKeys.PRESCRIPTION_ROUTES:
        case AdministrationParamsKeys.ADMINISTRATION_ROUTES: {
          unbuildLabelObjectFilter(currentCriterion, 'administration', value)
          break
        }
        case 'subject.active':
          break
        case PrescriptionParamsKeys.EXECUTIVE_UNITS:
        case AdministrationParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case PrescriptionParamsKeys.ENCOUNTER_STATUS:
        case AdministrationParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case PrescriptionParamsKeys.DATE:
        case AdministrationParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case PrescriptionParamsKeys.END_DATE: {
          if (value?.includes('ge')) {
            currentCriterion.endOccurrence = [unbuildDateFilter(value), currentCriterion.endOccurrence?.[1] ?? null]
          } else if (value?.includes('le')) {
            currentCriterion.endOccurrence = [currentCriterion.endOccurrence?.[0] ?? null, unbuildDateFilter(value)]
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.MEDICATION_REQUEST)}.${EncounterParamsKeys.START_DATE}`:
        case `${getCriterionDateFilterName(CriteriaType.MEDICATION_ADMINISTRATION)}.${
          EncounterParamsKeys.START_DATE
        }`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.MEDICATION_REQUEST)}.${EncounterParamsKeys.END_DATE}`:
        case `${getCriterionDateFilterName(CriteriaType.MEDICATION_ADMINISTRATION)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}
const unbuildObservationCriteria = async (element: RequeteurCriteriaType): Promise<ObservationDataType> => {
  const currentCriterion: ObservationDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.OBSERVATION,
    title: element.name ?? 'Critère de biologie',
    code: [],
    isLeaf: false,
    occurrence: null,
    startOccurrence: [null, null],
    encounterService: [],
    searchByValue: [null, null],
    valueComparator: Comparators.GREATER_OR_EQUAL,
    encounterStatus: [],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null]
  }

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    unbuildObservationValueFilter(filters, currentCriterion)

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null

      switch (key) {
        case ObservationParamsKeys.ANABIO_LOINC: {
          unbuildLabelObjectFilter(currentCriterion, 'code', value)

          // TODO: pas propre vvvv
          if (currentCriterion.code && currentCriterion.code.length === 1) {
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
        case ObservationParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case ObservationParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case ObservationParamsKeys.DATE: {
          if (value?.includes('ge')) {
            currentCriterion.startOccurrence[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.startOccurrence[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.OBSERVATION)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.OBSERVATION)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
        case ObservationParamsKeys.VALUE:
        case ObservationParamsKeys.VALIDATED_STATUS:
        case 'subject.active':
        case 'value-quantity':
          break
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}
const unbuildIPPListCriteria = (element: RequeteurCriteriaType): IPPListDataType => {
  const currentCriterion: IPPListDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.IPP_LIST,
    title: 'Critère de liste IPP',
    search: ''
  }

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter ? filter[0] : null
      const value = filter ? filter[1] : null

      switch (key) {
        case IppParamsKeys.IPP_LIST_FHIR: {
          currentCriterion.search = value ?? ''
          break
        }
        default:
          currentCriterion.error = true
          break
      }
    }
  }
  return currentCriterion
}
const unbuildImagingCriteria = async (element: RequeteurCriteriaType): Promise<ImagingDataType> => {
  const currentCriterion: ImagingDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.IMAGING,
    title: element.name ?? "Critère d'Imagerie",
    studyStartDate: null,
    studyEndDate: null,
    studyModalities: [],
    studyDescription: '',
    studyProcedure: '',
    numberOfSeries: 1,
    seriesComparator: Comparators.GREATER_OR_EQUAL,
    numberOfIns: 1,
    instancesComparator: Comparators.GREATER_OR_EQUAL,
    withDocument: DocumentAttachmentMethod.NONE,
    daysOfDelay: null,
    studyUid: '',
    seriesStartDate: null,
    seriesEndDate: null,
    seriesDescription: '',
    seriesProtocol: '',
    seriesModalities: [],
    seriesUid: '',
    occurrence: null,
    startOccurrence: [null, null],
    encounterStartDate: [null, null],
    encounterEndDate: [null, null],
    encounterService: [],
    encounterStatus: []
  }
  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))

    for (const filter of filters) {
      const key = filter[0]
      const value = filter[1]
      switch (key) {
        case ImagingParamsKeys.DATE: {
          if (value.includes('ge')) {
            currentCriterion.studyStartDate = unbuildDateFilter(value)
          } else if (value.includes('le')) {
            currentCriterion.studyEndDate = unbuildDateFilter(value)
          }
          break
        }
        case ImagingParamsKeys.MODALITY: {
          const modalitiesValues = value?.replace(/^[*|]+/, '')
          unbuildLabelObjectFilter(currentCriterion, 'studyModalities', modalitiesValues)
          break
        }
        case ImagingParamsKeys.STUDY_DESCRIPTION: {
          currentCriterion.studyDescription = unbuildSearchFilter(value)
          break
        }
        case ImagingParamsKeys.STUDY_PROCEDURE: {
          currentCriterion.studyProcedure = unbuildSearchFilter(value)
          break
        }
        case ImagingParamsKeys.NB_OF_SERIES: {
          const parsedOccurence = parseOccurence(value)
          currentCriterion.numberOfSeries = parsedOccurence.value
          currentCriterion.seriesComparator = parsedOccurence.comparator
          break
        }
        case ImagingParamsKeys.NB_OF_INS: {
          const parsedOccurence = parseOccurence(value)
          currentCriterion.numberOfIns = parsedOccurence.value
          currentCriterion.instancesComparator = parsedOccurence.comparator
          break
        }
        case ImagingParamsKeys.WITH_DOCUMENT: {
          const parsedDocumentAttachment = parseDocumentAttachment(value as DocumentAttachmentMethod)
          currentCriterion.withDocument = parsedDocumentAttachment.documentAttachmentMethod
          currentCriterion.daysOfDelay = parsedDocumentAttachment.daysOfDelay
          break
        }
        case ImagingParamsKeys.STUDY_UID: {
          currentCriterion.studyUid = value.replace(`${IMAGING_STUDY_UID_URL}|`, '') ?? ''
          break
        }
        case ImagingParamsKeys.SERIES_DATE: {
          if (value.includes('ge')) {
            currentCriterion.seriesStartDate = unbuildDateFilter(value)
          } else if (value.includes('le')) {
            currentCriterion.seriesEndDate = unbuildDateFilter(value)
          }
          break
        }
        case ImagingParamsKeys.SERIES_DESCRIPTION: {
          currentCriterion.seriesDescription = unbuildSearchFilter(value)
          break
        }
        case ImagingParamsKeys.SERIES_PROTOCOL: {
          currentCriterion.seriesProtocol = unbuildSearchFilter(value)
          break
        }
        case ImagingParamsKeys.SERIES_MODALITIES: {
          const modalitiesValues = value?.replace(/^[*|]+/, '')
          unbuildLabelObjectFilter(currentCriterion, 'seriesModalities', modalitiesValues)
          break
        }
        case ImagingParamsKeys.SERIES_UID: {
          currentCriterion.seriesUid = value ?? ''
          break
        }
        case ImagingParamsKeys.EXECUTIVE_UNITS: {
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', value)
          break
        }
        case ImagingParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', value)
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.IMAGING)}.${EncounterParamsKeys.START_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterStartDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterStartDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case `${getCriterionDateFilterName(CriteriaType.IMAGING)}.${EncounterParamsKeys.END_DATE}`: {
          if (value?.includes('ge')) {
            currentCriterion.encounterEndDate[0] = unbuildDateFilter(value)
          } else if (value?.includes('le')) {
            currentCriterion.encounterEndDate[1] = unbuildDateFilter(value)
          }
          break
        }
        case '_filter':
          unbuildEncounterDatesFilters(currentCriterion, value)
          break
      }
    }

    unbuildOccurrence(element, currentCriterion)
  }
  return currentCriterion
}

const unbuildPregnancyQuestionnaireResponseCriteria = async (
  element: RequeteurCriteriaType
): Promise<PregnancyDataType> => {
  const currentCriterion: PregnancyDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.PREGNANCY,
    title: element.name ?? 'Critère de Fiche de grossesse',
    pregnancyStartDate: null,
    pregnancyEndDate: null,
    pregnancyMode: [],
    foetus: 0,
    foetusComparator: Comparators.GREATER_OR_EQUAL,
    parity: 0,
    parityComparator: Comparators.GREATER_OR_EQUAL,
    maternalRisks: [],
    maternalRisksPrecision: '',
    risksRelatedToObstetricHistory: [],
    risksRelatedToObstetricHistoryPrecision: '',
    risksOrComplicationsOfPregnancy: [],
    risksOrComplicationsOfPregnancyPrecision: '',
    corticotherapie: [],
    prenatalDiagnosis: [],
    ultrasoundMonitoring: [],
    occurrence: null,
    encounterService: [],
    startOccurrence: [null, null],
    encounterStatus: []
  }
  if (element.filterFhir) {
    const splittedFilters = element.filterFhir.split('&')
    const cleanedFilters = unbuildQuestionnaireFilters(splittedFilters)

    unbuildOccurrence(element, currentCriterion)

    for (const { key, values } of cleanedFilters) {
      // this is bad design, we should properly handle multiple values and operators
      const { value: singleValue, operator } = values.length > 0 ? values[0] : { value: '', operator: 'eq' }
      const joinedValues = values.map((val) => val.value).join(',')

      switch (key) {
        case pregnancyForm.pregnancyStartDate.id:
          if (operator?.includes('ge')) {
            currentCriterion.pregnancyStartDate = unbuildDateFilter(singleValue)
          } else if (operator === 'le') {
            currentCriterion.pregnancyEndDate = unbuildDateFilter(singleValue)
          }
          break
        case pregnancyForm.pregnancyMode.id:
          unbuildLabelObjectFilter(currentCriterion, 'pregnancyMode', joinedValues)
          break
        case pregnancyForm.foetus.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.foetus = parsedOccurence.value
          currentCriterion.foetusComparator = parsedOccurence.comparator
          break
        }
        case pregnancyForm.parity.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.parity = parsedOccurence.value
          currentCriterion.parityComparator = parsedOccurence.comparator
          break
        }
        case pregnancyForm.maternalRisks.id:
          unbuildLabelObjectFilter(currentCriterion, 'maternalRisks', joinedValues)
          break
        case pregnancyForm.maternalRisksPrecision.id:
          currentCriterion.maternalRisksPrecision = unbuildSearchFilter(singleValue)
          break
        case pregnancyForm.risksRelatedToObstetricHistory.id:
          unbuildLabelObjectFilter(currentCriterion, 'risksRelatedToObstetricHistory', joinedValues)
          break
        case pregnancyForm.risksRelatedToObstetricHistoryPrecision.id:
          currentCriterion.risksRelatedToObstetricHistoryPrecision = unbuildSearchFilter(singleValue)
          break
        case pregnancyForm.risksOrComplicationsOfPregnancy.id:
          unbuildLabelObjectFilter(currentCriterion, 'risksOrComplicationsOfPregnancy', joinedValues)
          break
        case pregnancyForm.risksOrComplicationsOfPregnancyPrecision.id:
          currentCriterion.risksOrComplicationsOfPregnancyPrecision = unbuildSearchFilter(singleValue)
          break
        case pregnancyForm.corticotherapie.id:
          unbuildLabelObjectFilter(currentCriterion, 'corticotherapie', joinedValues)
          break
        case pregnancyForm.prenatalDiagnosis.id:
          unbuildLabelObjectFilter(currentCriterion, 'prenatalDiagnosis', joinedValues)
          break
        case pregnancyForm.ultrasoundMonitoring.id:
          unbuildLabelObjectFilter(currentCriterion, 'ultrasoundMonitoring', joinedValues)
          break
        case QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS:
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', joinedValues)
          break
        case QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', joinedValues)
          break
        }
      }
    }
  }
  return currentCriterion
}

const unbuildHospitQuestionnaireResponseCriteria = async (element: RequeteurCriteriaType): Promise<HospitDataType> => {
  const currentCriterion: HospitDataType = {
    ...unbuildCommonCriteria(element),
    title: "Critère de Fiche d'hospitalisation",
    type: CriteriaType.HOSPIT,
    hospitReason: '',
    inUteroTransfer: [],
    pregnancyMonitoring: [],
    vme: [],
    maturationCorticotherapie: [],
    chirurgicalGesture: [],
    childbirth: [],
    hospitalChildBirthPlace: [],
    otherHospitalChildBirthPlace: [],
    homeChildBirthPlace: [],
    childbirthMode: [],
    maturationReason: [],
    maturationModality: [],
    imgIndication: [],
    laborOrCesareanEntry: [],
    pathologyDuringLabor: [],
    obstetricalGestureDuringLabor: [],
    analgesieType: [],
    birthDeliveryStartDate: '', // TODO : check type
    birthDeliveryEndDate: '', // TODO : check type
    birthDeliveryWeeks: 0,
    birthDeliveryWeeksComparator: Comparators.GREATER_OR_EQUAL,
    birthDeliveryDays: 0,
    birthDeliveryDaysComparator: Comparators.GREATER_OR_EQUAL,
    birthDeliveryWay: [],
    instrumentType: [],
    cSectionModality: [],
    presentationAtDelivery: [],
    birthMensurationsGrams: 0,
    birthMensurationsGramsComparator: Comparators.GREATER_OR_EQUAL,
    birthMensurationsPercentil: 0,
    birthMensurationsPercentilComparator: Comparators.GREATER_OR_EQUAL,
    apgar1: 0,
    apgar1Comparator: Comparators.GREATER_OR_EQUAL,
    apgar3: 0,
    apgar3Comparator: Comparators.GREATER_OR_EQUAL,
    apgar5: 0,
    apgar5Comparator: Comparators.GREATER_OR_EQUAL,
    apgar10: 0,
    apgar10Comparator: Comparators.GREATER_OR_EQUAL,
    arterialPhCord: 0,
    arterialPhCordComparator: Comparators.GREATER_OR_EQUAL,
    arterialCordLactates: 0,
    arterialCordLactatesComparator: Comparators.GREATER_OR_EQUAL,
    birthStatus: [],
    postpartumHemorrhage: [],
    conditionPerineum: [],
    exitPlaceType: [],
    feedingType: [],
    complication: [],
    exitFeedingMode: [],
    exitDiagnostic: [],
    occurrence: null,
    startOccurrence: [null, null],
    encounterService: [],
    encounterStatus: []
  }

  if (element.filterFhir) {
    const splittedFilters = element.filterFhir.split('&')
    const cleanedFilters = unbuildQuestionnaireFilters(splittedFilters)

    unbuildOccurrence(element, currentCriterion)

    for (const { key, values } of cleanedFilters) {
      // this is bad design, we should properly handle multiple values and operators
      const { value: singleValue, operator } = values.length > 0 ? values[0] : { value: '', operator: 'eq' }
      const joinedValues = values.map((val) => val.value).join(',')

      switch (key) {
        case hospitForm.hospitReason.id:
          currentCriterion.hospitReason = unbuildSearchFilter(singleValue)
          break
        case hospitForm.inUteroTransfer.id:
          unbuildLabelObjectFilter(currentCriterion, 'inUteroTransfer', joinedValues)
          break
        case hospitForm.pregnancyMonitoring.id:
          unbuildLabelObjectFilter(currentCriterion, 'pregnancyMonitoring', joinedValues)
          break
        case hospitForm.vme.id:
          unbuildLabelObjectFilter(currentCriterion, 'vme', joinedValues)
          break
        case hospitForm.maturationCorticotherapie.id:
          unbuildLabelObjectFilter(currentCriterion, 'maturationCorticotherapie', joinedValues)
          break
        case hospitForm.chirurgicalGesture.id:
          unbuildLabelObjectFilter(currentCriterion, 'chirurgicalGesture', joinedValues)
          break
        case hospitForm.childbirth.id:
          unbuildLabelObjectFilter(currentCriterion, 'childbirth', joinedValues)
          break
        case hospitForm.hospitalChildBirthPlace.id:
          unbuildLabelObjectFilter(currentCriterion, 'hospitalChildBirthPlace', joinedValues)
          break
        case hospitForm.otherHospitalChildBirthPlace.id:
          unbuildLabelObjectFilter(currentCriterion, 'otherHospitalChildBirthPlace', joinedValues)
          break
        case hospitForm.homeChildBirthPlace.id:
          unbuildLabelObjectFilter(currentCriterion, 'homeChildBirthPlace', joinedValues)
          break
        case hospitForm.childbirthMode.id:
          unbuildLabelObjectFilter(currentCriterion, 'childbirthMode', joinedValues)
          break
        case hospitForm.maturationReason.id:
          unbuildLabelObjectFilter(currentCriterion, 'maturationReason', joinedValues)
          break
        case hospitForm.maturationModality.id:
          unbuildLabelObjectFilter(currentCriterion, 'maturationModality', joinedValues)
          break
        case hospitForm.imgIndication.id:
          unbuildLabelObjectFilter(currentCriterion, 'imgIndication', joinedValues)
          break
        case hospitForm.laborOrCesareanEntry.id:
          unbuildLabelObjectFilter(currentCriterion, 'laborOrCesareanEntry', joinedValues)
          break
        case hospitForm.pathologyDuringLabor.id:
          unbuildLabelObjectFilter(currentCriterion, 'pathologyDuringLabor', joinedValues)
          break
        case hospitForm.obstetricalGestureDuringLabor.id:
          unbuildLabelObjectFilter(currentCriterion, 'obstetricalGestureDuringLabor', joinedValues)
          break
        case hospitForm.analgesieType.id:
          unbuildLabelObjectFilter(currentCriterion, 'analgesieType', joinedValues)
          break
        case hospitForm.birthDeliveryStartDate.id:
          if (operator?.includes('ge')) {
            currentCriterion.birthDeliveryStartDate = unbuildDateFilter(singleValue)
          } else if (operator === 'le') {
            currentCriterion.birthDeliveryEndDate = unbuildDateFilter(singleValue)
          }
          break
        case hospitForm.birthDeliveryWeeks.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.birthDeliveryWeeks = parsedOccurence.value
          currentCriterion.birthDeliveryWeeksComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.birthDeliveryDays.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.birthDeliveryDays = parsedOccurence.value
          currentCriterion.birthDeliveryDaysComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.birthDeliveryWay.id:
          unbuildLabelObjectFilter(currentCriterion, 'birthDeliveryWay', joinedValues)
          break
        case hospitForm.instrumentType.id:
          unbuildLabelObjectFilter(currentCriterion, 'instrumentType', joinedValues)
          break
        case hospitForm.cSectionModality.id:
          unbuildLabelObjectFilter(currentCriterion, 'cSectionModality', joinedValues)
          break
        case hospitForm.presentationAtDelivery.id:
          unbuildLabelObjectFilter(currentCriterion, 'presentationAtDelivery', joinedValues)
          break
        case hospitForm.birthMensurationsGrams.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.birthMensurationsGrams = parsedOccurence.value
          currentCriterion.birthMensurationsGramsComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.birthMensurationsPercentil.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.birthMensurationsPercentil = parsedOccurence.value
          currentCriterion.birthMensurationsPercentilComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.apgar1.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.apgar1 = parsedOccurence.value
          currentCriterion.apgar1Comparator = parsedOccurence.comparator
          break
        }
        case hospitForm.apgar3.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.apgar3 = parsedOccurence.value
          currentCriterion.apgar3Comparator = parsedOccurence.comparator
          break
        }
        case hospitForm.apgar5.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.apgar5 = parsedOccurence.value
          currentCriterion.apgar5Comparator = parsedOccurence.comparator
          break
        }
        case hospitForm.apgar10.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.apgar10 = parsedOccurence.value
          currentCriterion.apgar10Comparator = parsedOccurence.comparator
          break
        }
        case hospitForm.arterialPhCord.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.arterialPhCord = parsedOccurence.value
          currentCriterion.arterialPhCordComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.arterialCordLactates.id: {
          const _value = `${operator}${singleValue}`
          const parsedOccurence = parseOccurence(_value)
          currentCriterion.arterialCordLactates = parsedOccurence.value
          currentCriterion.arterialCordLactatesComparator = parsedOccurence.comparator
          break
        }
        case hospitForm.birthStatus.id:
          unbuildLabelObjectFilter(currentCriterion, 'birthStatus', joinedValues)
          break
        case hospitForm.postpartumHemorrhage.id:
          unbuildLabelObjectFilter(currentCriterion, 'postpartumHemorrhage', joinedValues)
          break
        case hospitForm.conditionPerineum.id:
          unbuildLabelObjectFilter(currentCriterion, 'conditionPerineum', joinedValues)
          break
        case hospitForm.exitPlaceType.id:
          unbuildLabelObjectFilter(currentCriterion, 'exitPlaceType', joinedValues)
          break
        case hospitForm.feedingType.id:
          unbuildLabelObjectFilter(currentCriterion, 'feedingType', joinedValues)
          break
        case hospitForm.complication.id:
          unbuildLabelObjectFilter(currentCriterion, 'complication', joinedValues)
          break
        case hospitForm.exitFeedingMode.id:
          unbuildLabelObjectFilter(currentCriterion, 'exitFeedingMode', joinedValues)
          break
        case hospitForm.exitDiagnostic.id:
          unbuildLabelObjectFilter(currentCriterion, 'exitDiagnostic', joinedValues)
          break
        case QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS:
          await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', joinedValues)
          break
        case QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS: {
          unbuildLabelObjectFilter(currentCriterion, 'encounterStatus', joinedValues)
          break
        }
      }
    }
  }
  return currentCriterion
}

const unbuildQuestionnaireResponseCriteria = async (element: RequeteurCriteriaType): Promise<SelectedCriteriaType> => {
  if (element.filterFhir) {
    const splittedFilters = element.filterFhir.split('&')
    const findRessource = findQuestionnaireName(splittedFilters)

    switch (findRessource) {
      case FormNames.PREGNANCY:
        return unbuildPregnancyQuestionnaireResponseCriteria(element)
      case FormNames.HOSPIT:
        return unbuildHospitQuestionnaireResponseCriteria(element)
      default:
        break
    }
  }
  throw new Error('Unknown questionnaire response type')
}

export async function unbuildRequest(_json: string): Promise<any> {
  // TODO: handle potential errors (here or in the caller)
  // so if a single criteria fails, the whole request is not lost
  //  let population: (ScopeTreeRow | undefined)[] | null = null
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

  const population = await services.perimeters.fetchPopulationForRequeteur(caresiteCohortList)

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

  const _retrieveInformationFromJson = async (element: RequeteurCriteriaType): Promise<SelectedCriteriaType> => {
    const unbuildMapper: { [key in ResourceType]?: (el: RequeteurCriteriaType) => Promise<SelectedCriteriaType> } = {
      [ResourceType.PATIENT]: (el) => Promise.resolve(unbuildPatientCriteria(el)),
      [ResourceType.ENCOUNTER]: unbuildEncounterCriteria,
      [ResourceType.DOCUMENTS]: unbuildDocumentReferenceCriteria,
      [ResourceType.CONDITION]: unbuildConditionCriteria,
      [ResourceType.PROCEDURE]: unbuildProcedureCriteria,
      [ResourceType.CLAIM]: unbuildClaimCriteria,
      [ResourceType.MEDICATION_REQUEST]: unbuildMedicationCriteria,
      [ResourceType.MEDICATION_ADMINISTRATION]: unbuildMedicationCriteria,
      [ResourceType.OBSERVATION]: unbuildObservationCriteria,
      [ResourceType.IPP_LIST]: (el) => Promise.resolve(unbuildIPPListCriteria(el)),
      [ResourceType.IMAGING]: unbuildImagingCriteria,
      [ResourceType.QUESTIONNAIRE_RESPONSE]: unbuildQuestionnaireResponseCriteria
    }
    const unbuild = unbuildMapper[element.resourceType]
    if (unbuild) {
      return unbuild(element)
    }
    throw new Error('Unknown resource type')
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

  const convertJsonObjectsToCriteriaGroup: (_criteriaGroup: RequeteurGroupType[]) => CriteriaGroup[] = (
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
              } as CriteriaGroup)
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
                  (criterion.type === CriteriaType.MEDICATION_REQUEST ||
                    criterion.type === CriteriaType.MEDICATION_ADMINISTRATION))
            )

            if (currentSelectedCriteria) {
              for (const currentcriterion of currentSelectedCriteria) {
                if (
                  currentcriterion &&
                  !(
                    currentcriterion.type === CriteriaType.PATIENT ||
                    currentcriterion.type === CriteriaType.ENCOUNTER ||
                    currentcriterion.type === CriteriaType.IPP_LIST ||
                    currentcriterion.type === CriteriaType.DOCUMENTS ||
                    currentcriterion.type === CriteriaType.IMAGING ||
                    currentcriterion.type === CriteriaType.PREGNANCY ||
                    currentcriterion.type === CriteriaType.HOSPIT
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
    _type:
      newRequest.request?._type === CriteriaGroupType.AND_GROUP
        ? CriteriaGroupType.AND_GROUP
        : CriteriaGroupType.OR_GROUP,
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
      if (criterion?._type === CriteriaGroupType.OR_GROUP || criterion?._type === CriteriaGroupType.AND_GROUP) {
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
  selectedItems: Hierarchy<any, any>[],
  searchedItem: Hierarchy<any, any> | undefined,
  pmsiHierarchy: Hierarchy<any, any>[],
  valueSetSystem?: string
): boolean => {
  if (!searchedItem || !selectedItems || selectedItems.length === 0) return false
  selectedItems = selectedItems.filter(({ id }) => id !== 'loading')
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
