import moment from 'moment'

import services from 'services/aphp'
import {
  ScopeTreeRow,
  CriteriaGroupType,
  TemporalConstraintsType,
  CriteriaItemType,
  CriteriaItemDataCache,
  AbstractTree
} from 'types'

import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  MEDICATION_ATC,
  IMAGING_STUDY_UID_URL,
  PROCEDURE_HIERARCHY
} from '../constants'
import { DocumentAttachmentMethod, FormNames, LabelObject, SearchByTypes } from 'types/searchCriterias'
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
  buildEncounterServiceFilter,
  filtersBuilders,
  questionnaireFiltersBuilders,
  unbuildQuestionnaireFilters,
  findQuestionnaireName
} from './mappers'
import { pregnancyForm } from 'data/pregnancyData'
import { hospitForm } from 'data/hospitData'

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
    caresiteCohortList?: string[]
    providerCohortList?: string[]
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
        filtersBuilders(PATIENT_GENDER, buildLabelObjectFilter(criterion.genders)),
        filtersBuilders(PATIENT_DECEASED, buildLabelObjectFilter(criterion.vitalStatus)),
        filtersBuilders(PATIENT_BIRTHDATE, buildDateFilter(criterion.birthdates[1], 'le')),
        filtersBuilders(PATIENT_BIRTHDATE, buildDateFilter(criterion.birthdates[0], 'ge')),
        filtersBuilders(PATIENT_DEATHDATE, buildDateFilter(criterion.deathDates[0], 'ge')),
        filtersBuilders(PATIENT_DEATHDATE, buildDateFilter(criterion.deathDates[1], 'le')),
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
        filtersBuilders(ENCOUNTER_ADMISSIONMODE, buildLabelObjectFilter(criterion.admissionMode)),
        filtersBuilders(ENCOUNTER_ENTRYMODE, buildLabelObjectFilter(criterion.entryMode)),
        filtersBuilders(ENCOUNTER_EXITMODE, buildLabelObjectFilter(criterion.exitMode)),
        filtersBuilders(ENCOUNTER_PRISENCHARGETYPE, buildLabelObjectFilter(criterion.priseEnChargeType)),
        filtersBuilders(ENCOUNTER_TYPEDESEJOUR, buildLabelObjectFilter(criterion.typeDeSejour)),
        filtersBuilders(ENCOUNTER_FILESTATUS, buildLabelObjectFilter(criterion.fileStatus)),
        filtersBuilders(ENCOUNTER_DESTINATION, buildLabelObjectFilter(criterion.destination)),
        filtersBuilders(ENCOUNTER_PROVENANCE, buildLabelObjectFilter(criterion.provenance)),
        filtersBuilders(ENCOUNTER_ADMISSION, buildLabelObjectFilter(criterion.admission)),
        filtersBuilders(ENCOUNTER_REASON, buildLabelObjectFilter(criterion.reason)),
        filtersBuilders(SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
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
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(
          criterion.searchBy === SearchByTypes.TEXT ? COMPOSITION_TEXT : COMPOSITION_TITLE,
          buildSearchFilter(criterion.search)
        ),
        filtersBuilders(
          COMPOSITION_TYPE,
          buildLabelObjectFilter(
            criterion.docType?.map((docType) => {
              return {
                id: docType.code
              } as LabelObject
            })
          )
        )
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CONDITION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(CONDITION_CODE, buildLabelObjectFilter(criterion.code, CONDITION_HIERARCHY)),
        filtersBuilders(CONDITION_TYPE, buildLabelObjectFilter(criterion.diagnosticType)),
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService))
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.PROCEDURE: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(PROCEDURE_CODE, buildLabelObjectFilter(criterion.code, PROCEDURE_HIERARCHY)),
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
        buildSimpleFilter(criterion.source, PROCEDURE_SOURCE)
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.CLAIM: {
      const unreducedFilterFhir = [
        'patient.active=true',
        filtersBuilders(CLAIM_CODE, buildLabelObjectFilter(criterion.code, CLAIM_HIERARCHY)),
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService))
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.MEDICATION_REQUEST:
    case RessourceType.MEDICATION_ADMINISTRATION: {
      const unreducedFilterFhir = [
        'subject.active=true',
        filtersBuilders(
          criterion.type === RessourceType.MEDICATION_REQUEST
            ? MEDICATION_REQUEST_ROUTE
            : MEDICATION_ADMINISTRATION_ROUTE,
          buildLabelObjectFilter(criterion.administration)
        ),
        filtersBuilders(
          criterion.type === RessourceType.MEDICATION_REQUEST
            ? ENCOUNTER_SERVICE_PROVIDER
            : ENCOUNTER_CONTEXT_SERVICE_PROVIDER,
          buildEncounterServiceFilter(criterion.encounterService)
        ),
        filtersBuilders(MEDICATION_CODE, buildLabelObjectFilter(criterion.code, MEDICATION_ATC, true)),
        criterion.type === RessourceType.MEDICATION_REQUEST
          ? filtersBuilders(MEDICATION_PRESCRIPTION_TYPE, buildLabelObjectFilter(criterion.prescriptionType))
          : ''
      ].filter((elem) => elem)
      filterFhir =
        unreducedFilterFhir && unreducedFilterFhir.length > 0 ? unreducedFilterFhir.reduce(filterReducer) : ''
      break
    }

    case RessourceType.OBSERVATION: {
      const unreducedFilterFhir = [
        `subject.active=true&${OBSERVATION_STATUS}=Val`,
        filtersBuilders(OBSERVATION_CODE, buildLabelObjectFilter(criterion.code, BIOLOGY_HIERARCHY_ITM_ANABIO)),
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
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
        filtersBuilders(IMAGING_STUDY_DATE, buildDateFilter(criterion.studyStartDate, 'ge')),
        filtersBuilders(IMAGING_STUDY_DATE, buildDateFilter(criterion.studyEndDate, 'le')),
        filtersBuilders(IMAGING_SERIES_DATE, buildDateFilter(criterion.seriesStartDate, 'ge')),
        filtersBuilders(IMAGING_SERIES_DATE, buildDateFilter(criterion.seriesEndDate, 'le')),
        filtersBuilders(IMAGING_STUDY_DESCRIPTION, buildSearchFilter(criterion.studyDescription)),
        filtersBuilders(IMAGING_STUDY_PROCEDURE, buildSearchFilter(criterion.studyProcedure)),
        filtersBuilders(IMAGING_SERIES_DESCRIPTION, buildSearchFilter(criterion.seriesDescription)),
        filtersBuilders(IMAGING_SERIES_PROTOCOL, buildSearchFilter(criterion.seriesProtocol)),
        filtersBuilders(IMAGING_STUDY_MODALITIES, buildLabelObjectFilter(criterion.studyModalities)),
        filtersBuilders(IMAGING_SERIES_MODALITIES, buildLabelObjectFilter(criterion.seriesModalities)),
        filtersBuilders(ENCOUNTER_SERVICE_PROVIDER, buildEncounterServiceFilter(criterion.encounterService)),
        filtersBuilders(
          IMAGING_NB_OF_SERIES,
          buildComparatorFilter(criterion.numberOfSeries, criterion.seriesComparator)
        ),
        filtersBuilders(IMAGING_NB_OF_INS, buildComparatorFilter(criterion.numberOfIns, criterion.instancesComparator)),
        buildWithDocumentFilter(criterion, IMAGING_WITH_DOCUMENT),
        buildSimpleFilter(criterion.studyUid, IMAGING_STUDY_UID, IMAGING_STUDY_UID_URL),
        buildSimpleFilter(criterion.seriesUid, IMAGING_SERIES_UID)
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break
    }

    case RessourceType.PREGNANCY:
      filterFhir = [
        'subject.active=true',
        `questionnaire.name=${FormNames.PREGNANCY}`,
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
          { id: ENCOUNTER_SERVICE_PROVIDER, type: 'valueCoding' },
          buildEncounterServiceFilter(criterion.encounterService)
        )
      ]
        .filter((elem) => elem)
        .reduce(filterReducer)
      break

    case RessourceType.HOSPIT:
      filterFhir = [
        'subject.active=true',
        `questionnaire.name=${FormNames.HOSPIT}`,
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
          { id: ENCOUNTER_SERVICE_PROVIDER, type: 'valueCoding' },
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
          resourceType:
            item.type === RessourceType.HOSPIT || item.type === RessourceType.PREGNANCY
              ? RessourceType.QUESTIONNAIRE_RESPONSE
              : item.type,
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
        ?.map((_selectedPopulation) => _selectedPopulation?.cohort_id)
        .filter((item): item is string => !!item && item !== 'loading')
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
  // TODO: handle potential errors (here or in the caller)
  // so if a single criteria fails, the whole request is not lost
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

      case RessourceType.QUESTIONNAIRE_RESPONSE:
        if (element.filterFhir) {
          const splittedFilters = element.filterFhir.split('&')
          const findRessource = findQuestionnaireName(splittedFilters)
          const cleanedFilters = unbuildQuestionnaireFilters(splittedFilters)

          switch (findRessource) {
            case FormNames.PREGNANCY:
              currentCriterion.title = 'Critère de Fiche de grossesse'
              currentCriterion.type = RessourceType.PREGNANCY
              currentCriterion.pregnancyStartDate = null
              currentCriterion.pregnancyEndDate = null
              currentCriterion.pregnancyMode = []
              currentCriterion.foetus = 1
              currentCriterion.foetusComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.parity = 1
              currentCriterion.parityComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.maternalRisks = []
              currentCriterion.maternalRisksPrecision = ''
              currentCriterion.risksRelatedToObstetricHistory = []
              currentCriterion.risksRelatedToObstetricHistoryPrecision = ''
              currentCriterion.risksOrComplicationsOfPregnancy = []
              currentCriterion.risksOrComplicationsOfPregnancyPrecision = ''
              currentCriterion.corticotherapie = []
              currentCriterion.prenatalDiagnosis = []
              currentCriterion.ultrasoundMonitoring = []
              currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
              currentCriterion.encounterService = []

              unbuildAdvancedCriterias(element, currentCriterion)

              for (const { key, values } of cleanedFilters) {
                // this is bad design, we should properly handle multiple values and operators
                const { value: singleValue, operator } = values.length > 0 ? values[0] : { value: '', operator: 'eq' }
                const joinedValues = values.map((val) => val.value).join(',')

                switch (key) {
                  case pregnancyForm.pregnancyStartDate.id:
                    currentCriterion.pregnancyStartDate = unbuildDateFilter(singleValue)
                    break
                  case pregnancyForm.pregnancyEndDate.id:
                    currentCriterion.pregnancyEndDate = unbuildDateFilter(singleValue)
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
                  case ENCOUNTER_SERVICE_PROVIDER:
                    await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', joinedValues)
                    break
                }
              }
              break
            case FormNames.HOSPIT:
              currentCriterion.title = "Critère de Fiche d'hospitalisation"
              currentCriterion.type = RessourceType.HOSPIT
              currentCriterion.hospitReason = ''
              currentCriterion.inUteroTransfer = []
              currentCriterion.pregnancyMonitoring = []
              currentCriterion.vme = []
              currentCriterion.maturationCorticotherapie = []
              currentCriterion.chirurgicalGesture = []
              currentCriterion.childbirth = []
              currentCriterion.hospitalChildBirthPlace = []
              currentCriterion.otherHospitalChildBirthPlace = []
              currentCriterion.homeChildBirthPlace = []
              currentCriterion.childbirthMode = []
              currentCriterion.maturationReason = []
              currentCriterion.maturationModality = []
              currentCriterion.imgIndication = []
              currentCriterion.laborOrCesareanEntry = []
              currentCriterion.pathologyDuringLabor = []
              currentCriterion.obstetricalGestureDuringLabor = []
              currentCriterion.analgesieType = []
              currentCriterion.birthDeliveryStartDate = '' // TODO : check type
              currentCriterion.birthDeliveryEndDate = '' // TODO : check type
              currentCriterion.birthDeliveryWeeks = 1
              currentCriterion.birthDeliveryWeeksComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.birthDeliveryDays = 1
              currentCriterion.birthDeliveryDaysComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.birthDeliveryWay = []
              currentCriterion.instrumentType = []
              currentCriterion.cSectionModality = []
              currentCriterion.presentationAtDelivery = []
              currentCriterion.birthMensurationsGrams = 1
              currentCriterion.birthMensurationsGramsComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.birthMensurationsPercentil = 1
              currentCriterion.birthMensurationsPercentilComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.apgar1 = 1
              currentCriterion.apgar1Comparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.apgar3 = 1
              currentCriterion.apgar3Comparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.apgar5 = 1
              currentCriterion.apgar5Comparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.apgar10 = 1
              currentCriterion.apgar10Comparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.arterialPhCord = 1
              currentCriterion.arterialPhCordComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.arterialCordLactates = 1
              currentCriterion.arterialCordLactatesComparator = Comparators.GREATER_OR_EQUAL
              currentCriterion.birthStatus = []
              currentCriterion.postpartumHemorrhage = []
              currentCriterion.conditionPerineum = []
              currentCriterion.exitPlaceType = []
              currentCriterion.feedingType = []
              currentCriterion.complication = []
              currentCriterion.exitFeedingMode = []
              currentCriterion.exitDiagnostic = []
              currentCriterion.occurrence = currentCriterion.occurrence ? currentCriterion.occurrence : null
              currentCriterion.encounterService = []

              unbuildAdvancedCriterias(element, currentCriterion)

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
                    currentCriterion.birthDeliveryStartDate = unbuildDateFilter(singleValue)
                    break
                  case hospitForm.birthDeliveryEndDate.id:
                    currentCriterion.birthDeliveryEndDate = unbuildDateFilter(singleValue)
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
                  case ENCOUNTER_SERVICE_PROVIDER:
                    await unbuildEncounterServiceCriterias(currentCriterion, 'encounterService', joinedValues)
                    break
                }
              }
              break
            default:
              break
          }
        }
        break

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
                    currentcriterion.type === RessourceType.IMAGING ||
                    currentcriterion.type === RessourceType.PREGNANCY ||
                    currentcriterion.type === RessourceType.HOSPIT
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
  selectedItems: AbstractTree<any>[],
  searchedItem: AbstractTree<any> | undefined,
  pmsiHierarchy: AbstractTree<any>[],
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
