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
  HospitDataType,
  SelectedCriteriaTypesWithOccurrences
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

    const cleanValue = (value: string | null | undefined) => {
      if (value !== null && value !== undefined) {
        return value.replace(regex, '0/') === '0/0/0' ? null : value.replace(regex, '0/')
      } else return null
    }

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
  const groupsIdsToDelete = criteriaGroups
    .filter((group) => !group.criteriaIds.filter((id) => id > 0).some((id) => cleanedCriteriasIds.includes(id)))
    .map((group) => group.id)
  const cleanedGroups = criteriaGroups
    .map((group) => {
      const cleanIds = group.criteriaIds.filter((id) => {
        // id < 0 would be a group, and id > 0 a criteria
        if (id > 0) {
          return cleanedCriteriasIds.includes(id)
        } else {
          const nestedGroup = criteriaGroups.find((nestedGroup) => nestedGroup.id === id)
          return nestedGroup?.criteriaIds.some((id) => cleanedCriteriasIds.includes(id))
        }
      })

      return {
        ...group,
        criteriaIds: cleanIds
      }
    })
    .filter((group) => !groupsIdsToDelete.includes(group.id))
  dispatch(editAllCriteriaGroup(cleanedGroups))
  dispatch(editAllCriteria(cleanedSelectedCriteria))
  dispatch(pseudonimizeCriteria())
  if (selectedPopulation != undefined && selectedPopulation.length > 0) {
    dispatch(buildCohortCreation({ selectedPopulation: selectedPopulation }))
  } else {
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }
}

const buildPatientFilter = (criterion: DemographicDataType, deidentified: boolean): string[] => {
  const isDeidentified = deidentified ? PatientsParamsKeys.DATE_DEIDENTIFIED : PatientsParamsKeys.DATE_IDENTIFIED
  return [
    'active=true',
    filtersBuilders(PatientsParamsKeys.GENDERS, buildLabelObjectFilter(criterion.genders)),
    filtersBuilders(PatientsParamsKeys.VITAL_STATUS, buildLabelObjectFilter(criterion.vitalStatus)),
    filtersBuilders(PatientsParamsKeys.BIRTHDATE, buildDateFilter(criterion.birthdates[1], 'le')),
    filtersBuilders(PatientsParamsKeys.BIRTHDATE, buildDateFilter(criterion.birthdates[0], 'ge')),
    filtersBuilders(PatientsParamsKeys.DEATHDATE, buildDateFilter(criterion.deathDates[0], 'ge')),
    filtersBuilders(PatientsParamsKeys.DEATHDATE, buildDateFilter(criterion.deathDates[1], 'le')),
    criterion.birthdates[0] === null && criterion.birthdates[1] === null
      ? buildDurationFilter(criterion.age[0], isDeidentified, 'ge', deidentified)
      : '',
    criterion.birthdates[0] === null && criterion.birthdates[1] === null
      ? buildDurationFilter(criterion.age[1], isDeidentified, 'le', deidentified)
      : ''
  ]
}

const buildEncounterFilter = (criterion: EncounterDataType, deidentified: boolean): string[] => {
  const isMinBirthdateDeidentified = deidentified
    ? EncounterParamsKeys.MIN_BIRTHDATE_MONTH
    : EncounterParamsKeys.MIN_BIRTHDATE_DAY
  return [
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
      ? buildDurationFilter(criterion?.age[0], isMinBirthdateDeidentified, 'ge', deidentified)
      : '',
    criterion.age[1] !== null
      ? buildDurationFilter(criterion?.age[1], isMinBirthdateDeidentified, 'le', deidentified)
      : '',
    buildEncounterDateFilter(
      criterion.type,
      criterion.includeEncounterStartDateNull,
      criterion.encounterStartDate,
      true
    ),
    buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
  ]
}

const buildDocumentFilter = (criterion: DocumentDataType): string[] => {
  const joinDocStatuses = (docStatuses: string[]): string => {
    const filterDocStatuses: string[] = []
    for (const _status of docStatuses) {
      const status =
        _status === FilterByDocumentStatus.VALIDATED ? DocumentStatuses.FINAL : DocumentStatuses.PRELIMINARY
      filterDocStatuses.push(`${DOC_STATUS_CODE_SYSTEM}|${status}`)
    }
    return filterDocStatuses.join(',')
  }

  return [
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
    filtersBuilders(DocumentsParamsKeys.ENCOUNTER_STATUS, buildLabelObjectFilter(criterion.encounterStatus)),
    filtersBuilders(DocumentsParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[0], 'ge')),
    filtersBuilders(DocumentsParamsKeys.DATE, buildDateFilter(criterion.startOccurrence[1], 'le')),
    buildEncounterDateFilter(
      criterion.type,
      criterion.includeEncounterStartDateNull,
      criterion.encounterStartDate,
      true
    ),
    buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
  ]
}

const buildConditionFilter = (criterion: Cim10DataType): string[] => {
  return [
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
  ]
}

const buildProcedureFilter = (criterion: CcamDataType): string[] => {
  return [
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
  ]
}

const buildClaimFilter = (criterion: GhmDataType): string[] => {
  return [
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
  ]
}

const buildMedicationFilter = (criterion: MedicationDataType): string[] => {
  return [
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
      criterion.type === CriteriaType.MEDICATION_REQUEST ? PrescriptionParamsKeys.DATE : AdministrationParamsKeys.DATE,
      buildDateFilter(criterion.startOccurrence[0], 'ge')
    ),
    filtersBuilders(
      criterion.type === CriteriaType.MEDICATION_REQUEST ? PrescriptionParamsKeys.DATE : AdministrationParamsKeys.DATE,
      buildDateFilter(criterion.startOccurrence[1], 'le')
    ),
    filtersBuilders(PrescriptionParamsKeys.END_DATE, buildDateFilter(criterion.endOccurrence?.[0], 'ge')),
    filtersBuilders(PrescriptionParamsKeys.END_DATE, buildDateFilter(criterion.endOccurrence?.[1], 'le')),
    criterion.type === CriteriaType.MEDICATION_REQUEST
      ? filtersBuilders(PrescriptionParamsKeys.PRESCRIPTION_TYPES, buildLabelObjectFilter(criterion.prescriptionType))
      : '',
    buildEncounterDateFilter(
      criterion.type,
      criterion.includeEncounterStartDateNull,
      criterion.encounterStartDate,
      true
    ),
    buildEncounterDateFilter(criterion.type, criterion.includeEncounterEndDateNull, criterion.encounterEndDate)
  ]
}

const buildObservationFilter = (criterion: ObservationDataType): string[] => {
  return [
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
  ]
}

const buildImagingFilter = (criterion: ImagingDataType): string[] => {
  return [
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
}

const buildPregnancyFilter = (criterion: PregnancyDataType): string[] => {
  return [
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
    questionnaireFiltersBuilders(pregnancyForm.prenatalDiagnosis, buildLabelObjectFilter(criterion.prenatalDiagnosis)),
    questionnaireFiltersBuilders(
      pregnancyForm.ultrasoundMonitoring,
      buildLabelObjectFilter(criterion.ultrasoundMonitoring)
    ),
    questionnaireFiltersBuilders(
      { id: QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS, type: 'valueCoding' },
      buildEncounterServiceFilter(criterion.encounterService)
    )
  ]
}

const buildHospitFilter = (criterion: HospitDataType): string[] => {
  return [
    'subject.active=true',
    `questionnaire.name=${FormNames.HOSPIT}`,
    'status=in-progress,completed',
    filtersBuilders(
      QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS,
      buildLabelObjectFilter(criterion.encounterStatus)
    ),
    questionnaireFiltersBuilders(hospitForm.hospitReason, buildSearchFilter(criterion.hospitReason)),
    questionnaireFiltersBuilders(hospitForm.inUteroTransfer, buildLabelObjectFilter(criterion.inUteroTransfer)),
    questionnaireFiltersBuilders(hospitForm.pregnancyMonitoring, buildLabelObjectFilter(criterion.pregnancyMonitoring)),
    questionnaireFiltersBuilders(hospitForm.vme, buildLabelObjectFilter(criterion.vme)),
    questionnaireFiltersBuilders(
      hospitForm.maturationCorticotherapie,
      buildLabelObjectFilter(criterion.maturationCorticotherapie)
    ),
    questionnaireFiltersBuilders(hospitForm.chirurgicalGesture, buildLabelObjectFilter(criterion.chirurgicalGesture)),
    questionnaireFiltersBuilders(hospitForm.childbirth, buildLabelObjectFilter(criterion.childbirth)),
    questionnaireFiltersBuilders(
      hospitForm.hospitalChildBirthPlace,
      buildLabelObjectFilter(criterion.hospitalChildBirthPlace)
    ),
    questionnaireFiltersBuilders(
      hospitForm.otherHospitalChildBirthPlace,
      buildLabelObjectFilter(criterion.otherHospitalChildBirthPlace)
    ),
    questionnaireFiltersBuilders(hospitForm.homeChildBirthPlace, buildLabelObjectFilter(criterion.homeChildBirthPlace)),
    questionnaireFiltersBuilders(hospitForm.childbirthMode, buildLabelObjectFilter(criterion.childbirthMode)),
    questionnaireFiltersBuilders(hospitForm.maturationReason, buildLabelObjectFilter(criterion.maturationReason)),
    questionnaireFiltersBuilders(hospitForm.maturationModality, buildLabelObjectFilter(criterion.maturationModality)),
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
}

const constructFilterFhir = (criterion: SelectedCriteriaType, deidentified: boolean): string => {
  const filterReducer = (accumulator: string, currentValue: string): string =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator

  const filterBuilders: Partial<{ [K in CriteriaType]: (c: SelectedCriteriaType, b: boolean) => string[] }> = {
    [CriteriaType.PATIENT]: (c, b) => buildPatientFilter(c as DemographicDataType, b),
    [CriteriaType.ENCOUNTER]: (c, b) => buildEncounterFilter(c as EncounterDataType, b),
    [CriteriaType.DOCUMENTS]: (c) => buildDocumentFilter(c as DocumentDataType),
    [CriteriaType.CONDITION]: (c) => buildConditionFilter(c as Cim10DataType),
    [CriteriaType.PROCEDURE]: (c) => buildProcedureFilter(c as CcamDataType),
    [CriteriaType.CLAIM]: (c) => buildClaimFilter(c as GhmDataType),
    [CriteriaType.MEDICATION_REQUEST]: (c) => buildMedicationFilter(c as MedicationDataType),
    [CriteriaType.MEDICATION_ADMINISTRATION]: (c) => buildMedicationFilter(c as MedicationDataType),
    [CriteriaType.OBSERVATION]: (c) => buildObservationFilter(c as ObservationDataType),
    [CriteriaType.IPP_LIST]: (c) =>
      ((criterion: IPPListDataType) => [filtersBuilders(IppParamsKeys.IPP_LIST_FHIR, criterion.search)])(
        c as IPPListDataType
      ),
    [CriteriaType.IMAGING]: (c) => buildImagingFilter(c as ImagingDataType),
    [CriteriaType.PREGNANCY]: (c) => buildPregnancyFilter(c as PregnancyDataType),
    [CriteriaType.HOSPIT]: (c) => buildHospitFilter(c as HospitDataType)
  }

  return (filterBuilders[criterion.type]?.(criterion, deidentified) || [])
    .filter((elem) => elem)
    .reduce(filterReducer, '')
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
                operator: item?.occurrenceComparator ?? undefined
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

const unbuildCriteria = async <T extends SelectedCriteriaTypesWithOccurrences | SelectedCriteriaType>(
  element: RequeteurCriteriaType,
  emptyCriterion: T,
  filterUnbuilders: Partial<{ [key: string]: (c: T, v: string | null) => Promise<void> | void }>
): Promise<T> => {
  if (emptyCriterion.type !== CriteriaType.PATIENT && emptyCriterion.type !== CriteriaType.IPP_LIST)
    unbuildOccurrence(element, emptyCriterion as SelectedCriteriaTypesWithOccurrences)

  if (element.filterFhir) {
    const filters = element.filterFhir.split('&').map((elem) => elem.split('='))
    if (emptyCriterion.type === CriteriaType.OBSERVATION)
      unbuildObservationValueFilter(filters, emptyCriterion as ObservationDataType)

    for (const filter of filters) {
      const key = filter[0] ?? null
      const value = filter[1] ?? null
      if (key !== null) await filterUnbuilders[key]?.(emptyCriterion, value)
      else emptyCriterion.error = true
    }
  }
  return emptyCriterion
}

const unbuildPatientCriteria = async (element: RequeteurCriteriaType): Promise<DemographicDataType> => {
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

  return await unbuildCriteria(element, currentCriterion, {
    [PatientsParamsKeys.DATE_IDENTIFIED]: (c, v) => {
      if (v?.includes('ge')) {
        c.age[0] = unbuildDurationFilter(v, false)
      } else if (v?.includes('le')) {
        c.age[1] = unbuildDurationFilter(v, false)
      }
    },
    [PatientsParamsKeys.DATE_DEIDENTIFIED]: (c, v) => {
      if (v?.includes('ge')) {
        c.age[0] = unbuildDurationFilter(v, true)
      } else if (v?.includes('le')) {
        c.age[1] = unbuildDurationFilter(v, true)
      }
    },
    [PatientsParamsKeys.BIRTHDATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.birthdates[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.birthdates[1] = unbuildDateFilter(v)
      }
    },
    [PatientsParamsKeys.DEATHDATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.deathDates[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.deathDates[1] = unbuildDateFilter(v)
      }
    },
    [PatientsParamsKeys.GENDERS]: (c, v) => {
      unbuildLabelObjectFilter(c, 'genders', v)
    },
    [PatientsParamsKeys.VITAL_STATUS]: (c, v) => {
      unbuildLabelObjectFilter(c, 'vitalStatus', v)
    }
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [EncounterParamsKeys.DURATION]: (c, v) => {
      if (v?.includes('ge')) {
        c.duration[0] = unbuildDurationFilter(v)
      } else if (v?.includes('le')) {
        c.duration[1] = unbuildDurationFilter(v)
      }
    },
    [EncounterParamsKeys.MIN_BIRTHDATE_DAY]: (c, v) => {
      if (v?.includes('ge')) {
        c.age[0] = unbuildDurationFilter(v)
      } else if (v?.includes('le')) {
        c.age[1] = unbuildDurationFilter(v)
      }
    },
    [EncounterParamsKeys.MIN_BIRTHDATE_MONTH]: (c, v) => {
      if (v?.includes('ge')) {
        c.age[0] = unbuildDurationFilter(v, true)
      } else if (v?.includes('le')) {
        c.age[1] = unbuildDurationFilter(v, true)
      }
    },
    [EncounterParamsKeys.ENTRYMODE]: (c, v) => {
      unbuildLabelObjectFilter(c, 'entryMode', v)
    },
    [EncounterParamsKeys.EXITMODE]: (c, v) => {
      unbuildLabelObjectFilter(c, 'exitMode', v)
    },
    [EncounterParamsKeys.PRISENCHARGETYPE]: (c, v) => {
      unbuildLabelObjectFilter(c, 'priseEnChargeType', v)
    },
    [EncounterParamsKeys.TYPEDESEJOUR]: (c, v) => {
      unbuildLabelObjectFilter(c, 'typeDeSejour', v)
    },
    [EncounterParamsKeys.REASON]: (c, v) => {
      unbuildLabelObjectFilter(c, 'reason', v)
    },
    [EncounterParamsKeys.ADMISSIONMODE]: (c, v) => {
      unbuildLabelObjectFilter(c, 'admissionMode', v)
    },
    [EncounterParamsKeys.DESTINATION]: (c, v) => {
      unbuildLabelObjectFilter(c, 'destination', v)
    },
    [EncounterParamsKeys.PROVENANCE]: (c, v) => {
      unbuildLabelObjectFilter(c, 'provenance', v)
    },
    [EncounterParamsKeys.ADMISSION]: (c, v) => {
      unbuildLabelObjectFilter(c, 'admission', v)
    },
    [EncounterParamsKeys.SERVICE_PROVIDER]: async (c, v) => {
      await unbuildEncounterServiceCriterias(c, 'encounterService', v)
    },
    [EncounterParamsKeys.STATUS]: (c, v) => {
      unbuildLabelObjectFilter(c, 'encounterStatus', v)
    },
    [EncounterParamsKeys.START_DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [EncounterParamsKeys.END_DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => {
      unbuildEncounterDatesFilters(c, v)
    }
  })
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
  return await unbuildCriteria(element, currentCriterion, {
    [SearchByTypes.DESCRIPTION]: (c, v) => {
      c.search = unbuildSearchFilter(v)
      c.searchBy = SearchByTypes.DESCRIPTION
    },
    [SearchByTypes.TEXT]: (c, v) => {
      c.search = unbuildSearchFilter(v)
      c.searchBy = SearchByTypes.TEXT
    },
    [DocumentsParamsKeys.DOC_TYPES]: (c, v) => {
      unbuildDocTypesFilter(c, 'docType', v)
    },
    [DocumentsParamsKeys.EXECUTIVE_UNITS]: async (c, v) => {
      await unbuildEncounterServiceCriterias(c, 'encounterService', v)
    },
    [DocumentsParamsKeys.DOC_STATUSES]: (c, v) => {
      unbuildDocStatusesFilter(c, 'docStatuses', v)
    },
    [DocumentsParamsKeys.ENCOUNTER_STATUS]: (c, v) => {
      unbuildLabelObjectFilter(c, 'encounterStatus', v)
    },
    [DocumentsParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.DOCUMENTS)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.DOCUMENTS)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => {
      unbuildEncounterDatesFilters(c, v)
    }
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [ConditionParamsKeys.CODE]: (c, v) => unbuildLabelObjectFilter(c, 'code', v),
    [ConditionParamsKeys.SOURCE]: (c, v) => (c.source = v),
    [ConditionParamsKeys.DIAGNOSTIC_TYPES]: (c, v) => unbuildLabelObjectFilter(c, 'diagnosticType', v),
    [ConditionParamsKeys.EXECUTIVE_UNITS]: async (c, v) =>
      await unbuildEncounterServiceCriterias(c, 'encounterService', v),
    [ConditionParamsKeys.ENCOUNTER_STATUS]: (c, v) => unbuildLabelObjectFilter(c, 'encounterStatus', v),
    [ConditionParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.CONDITION)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.CONDITION)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => unbuildEncounterDatesFilters(c, v)
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [ProcedureParamsKeys.CODE]: (c, v) => unbuildLabelObjectFilter(c, 'code', v),
    [ProcedureParamsKeys.EXECUTIVE_UNITS]: async (c, v) =>
      await unbuildEncounterServiceCriterias(c, 'encounterService', v),
    [ProcedureParamsKeys.SOURCE]: (c, v) => (c.source = v),
    [ProcedureParamsKeys.ENCOUNTER_STATUS]: (c, v) => unbuildLabelObjectFilter(c, 'encounterStatus', v),
    [ProcedureParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.PROCEDURE)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.PROCEDURE)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => unbuildEncounterDatesFilters(c, v)
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [ClaimParamsKeys.CODE]: (c, v) => unbuildLabelObjectFilter(c, 'code', v),
    [ClaimParamsKeys.EXECUTIVE_UNITS]: async (c, v) => await unbuildEncounterServiceCriterias(c, 'encounterService', v),
    [ClaimParamsKeys.ENCOUNTER_STATUS]: (c, v) => unbuildLabelObjectFilter(c, 'encounterStatus', v),
    [ClaimParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.CLAIM)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.CLAIM)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => unbuildEncounterDatesFilters(c, v)
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [PrescriptionParamsKeys.CODE]: (c, v) => {
      const codeIds = v?.replace(/https:\/\/.*?\|/g, '')
      unbuildLabelObjectFilter(c, 'code', codeIds)
    },
    [PrescriptionParamsKeys.PRESCRIPTION_TYPES]: (c, v) => unbuildLabelObjectFilter(c, 'prescriptionType', v),
    [PrescriptionParamsKeys.PRESCRIPTION_ROUTES || AdministrationParamsKeys.ADMINISTRATION_ROUTES]: (c, v) =>
      unbuildLabelObjectFilter(c, 'administration', v),
    [PrescriptionParamsKeys.EXECUTIVE_UNITS || AdministrationParamsKeys.EXECUTIVE_UNITS]: async (c, v) =>
      await unbuildEncounterServiceCriterias(c, 'encounterService', v),
    [PrescriptionParamsKeys.ENCOUNTER_STATUS || AdministrationParamsKeys.ENCOUNTER_STATUS]: (c, v) =>
      unbuildLabelObjectFilter(c, 'encounterStatus', v),
    [PrescriptionParamsKeys.DATE || AdministrationParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [PrescriptionParamsKeys.END_DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.endOccurrence = [unbuildDateFilter(v), c.endOccurrence?.[1] ?? null]
      } else if (v?.includes('le')) {
        c.endOccurrence = [c.endOccurrence?.[0] ?? null, unbuildDateFilter(v)]
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.MEDICATION_REQUEST || CriteriaType.MEDICATION_ADMINISTRATION)}.${
      EncounterParamsKeys.START_DATE
    }`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.MEDICATION_REQUEST || CriteriaType.MEDICATION_ADMINISTRATION)}.${
      EncounterParamsKeys.END_DATE
    }`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => unbuildEncounterDatesFilters(c, v)
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [ObservationParamsKeys.ANABIO_LOINC]: async (c, v) => {
      unbuildLabelObjectFilter(c, 'code', v)

      // TODO: pas propre vvvv
      if (currentCriterion.code && currentCriterion.code.length === 1) {
        try {
          const checkChildrenResp = await services.cohortCreation.fetchBiologyHierarchy(currentCriterion.code?.[0].id)

          if (checkChildrenResp.length === 0) {
            currentCriterion.isLeaf = true
          }
        } catch (error) {
          console.error('Erreur lors du check des enfants du code de biologie sélectionné', error)
        }
      }
    },
    [ObservationParamsKeys.EXECUTIVE_UNITS]: async (c, v) =>
      await unbuildEncounterServiceCriterias(c, 'encounterService', v),
    [ObservationParamsKeys.ENCOUNTER_STATUS]: (c, v) => unbuildLabelObjectFilter(c, 'encounterStatus', v),
    [ObservationParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.startOccurrence[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.startOccurrence[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.OBSERVATION)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.OBSERVATION)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => unbuildEncounterDatesFilters(c, v)
  })
}
const unbuildIPPListCriteria = async (element: RequeteurCriteriaType): Promise<IPPListDataType> => {
  const currentCriterion: IPPListDataType = {
    ...unbuildCommonCriteria(element),
    type: CriteriaType.IPP_LIST,
    title: 'Critère de liste IPP',
    search: ''
  }

  return await unbuildCriteria(element, currentCriterion, {
    [IppParamsKeys.IPP_LIST_FHIR]: (c, v) => {
      c.search = v ?? ''
    }
  })
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

  return await unbuildCriteria(element, currentCriterion, {
    [ImagingParamsKeys.DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.studyStartDate = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.studyEndDate = unbuildDateFilter(v)
      }
    },
    [ImagingParamsKeys.MODALITY]: (c, v) => {
      const modalitiesValues = v?.replace(/^[*|]+/, '')
      unbuildLabelObjectFilter(c, 'studyModalities', modalitiesValues)
    },
    [ImagingParamsKeys.STUDY_DESCRIPTION]: (c, v) => {
      c.studyDescription = unbuildSearchFilter(v)
    },
    [ImagingParamsKeys.STUDY_PROCEDURE]: (c, v) => {
      c.studyProcedure = unbuildSearchFilter(v)
    },
    [ImagingParamsKeys.NB_OF_SERIES]: (c, v) => {
      const parsedOccurence = v ? parseOccurence(v) : null
      c.numberOfSeries = parsedOccurence !== null ? parsedOccurence.value : 1
      c.seriesComparator = parsedOccurence !== null ? parsedOccurence.comparator : Comparators.GREATER_OR_EQUAL
    },
    [ImagingParamsKeys.NB_OF_INS]: (c, v) => {
      const parsedOccurence = v ? parseOccurence(v) : null
      c.numberOfIns = parsedOccurence !== null ? parsedOccurence.value : 1
      c.instancesComparator = parsedOccurence !== null ? parsedOccurence.comparator : Comparators.GREATER_OR_EQUAL
    },
    [ImagingParamsKeys.WITH_DOCUMENT]: (c, v) => {
      const parsedDocumentAttachment = parseDocumentAttachment(v as DocumentAttachmentMethod)
      c.withDocument = parsedDocumentAttachment.documentAttachmentMethod
      c.daysOfDelay = parsedDocumentAttachment.daysOfDelay
    },
    [ImagingParamsKeys.STUDY_UID]: (c, v) => {
      c.studyUid = v?.replace(`${IMAGING_STUDY_UID_URL}|`, '') ?? ''
    },
    [ImagingParamsKeys.SERIES_DATE]: (c, v) => {
      if (v?.includes('ge')) {
        c.seriesStartDate = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.seriesEndDate = unbuildDateFilter(v)
      }
    },
    [ImagingParamsKeys.SERIES_DESCRIPTION]: (c, v) => {
      c.seriesDescription = unbuildSearchFilter(v)
    },
    [ImagingParamsKeys.SERIES_PROTOCOL]: (c, v) => {
      c.seriesProtocol = unbuildSearchFilter(v)
    },
    [ImagingParamsKeys.SERIES_MODALITIES]: (c, v) => {
      const modalitiesValues = v?.replace(/^[*|]+/, '')
      unbuildLabelObjectFilter(c, 'seriesModalities', modalitiesValues)
    },
    [ImagingParamsKeys.SERIES_UID]: (c, v) => {
      c.seriesUid = v ?? ''
    },
    [ImagingParamsKeys.EXECUTIVE_UNITS]: async (c, v) => {
      await unbuildEncounterServiceCriterias(c, 'encounterService', v)
    },
    [ImagingParamsKeys.ENCOUNTER_STATUS]: (c, v) => {
      unbuildLabelObjectFilter(c, 'encounterStatus', v)
    },
    [`${getCriterionDateFilterName(CriteriaType.IMAGING)}.${EncounterParamsKeys.START_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterStartDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterStartDate[1] = unbuildDateFilter(v)
      }
    },
    [`${getCriterionDateFilterName(CriteriaType.IMAGING)}.${EncounterParamsKeys.END_DATE}`]: (c, v) => {
      if (v?.includes('ge')) {
        c.encounterEndDate[0] = unbuildDateFilter(v)
      } else if (v?.includes('le')) {
        c.encounterEndDate[1] = unbuildDateFilter(v)
      }
    },
    ['_filter']: (c, v) => {
      unbuildEncounterDatesFilters(c, v)
    }
  })
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

  unbuildOccurrence(element, currentCriterion)

  if (element.filterFhir) {
    const splittedFilters = element.filterFhir.split('&')
    const cleanedFilters = unbuildQuestionnaireFilters(splittedFilters)

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
