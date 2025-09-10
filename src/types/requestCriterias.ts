import { GhmDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/GHMForm'
import { HospitDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/HospitForm'
import { ImagingDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/ImagingForm'
import { ObservationDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'
import { CcamDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'
import { DemographicDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DemographicForm'
import { Cim10DataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/Cim10Form'
import { DocumentDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DocumentsForm'
import { EncounterDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/EncounterForm'
import { MedicationDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/MedicationForm'
import { PregnancyDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/PregnancyForm'
import { IPPListDataType } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/IPPForm'
import { onUpdateConfig } from 'config'
import { hasSearchParam } from 'services/aphp/serviceFhirConfig'

export enum IppParamsKeys {
  IPP_LIST_FHIR = 'identifier.value'
}

export enum MedicationLabel {
  PRESCRIPTION = 'Prescription',
  ADMINISTRATION = 'Administration'
}

export enum ResourceType {
  TIMELINE = 'timeline',
  PREVIEW = 'preview',
  UNKNOWN = 'Unknown',
  IPP_LIST = 'IPPList',
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  DOCUMENTS = 'DocumentReference',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  CLAIM = 'Claim',
  MEDICATION_REQUEST = 'MedicationRequest',
  MEDICATION_ADMINISTRATION = 'MedicationAdministration',
  OBSERVATION = 'Observation',
  IMAGING = 'ImagingStudy',
  QUESTIONNAIRE_RESPONSE = 'QuestionnaireResponse'
}

export type PMSIResourceTypes = ResourceType.CONDITION | ResourceType.PROCEDURE | ResourceType.CLAIM

export enum PatientsParamsKeys {
  GENDERS = 'gender',
  DATE_DEIDENTIFIED = 'age-month',
  DATE_IDENTIFIED = 'age-day',
  VITAL_STATUS = 'deceased',
  BIRTHDATE = 'birthdate',
  DEATHDATE = 'death-date'
}

const encounterCareSite = 'service-provider'

export const EncounterParamsKeys = {
  DURATION: 'length',
  MIN_BIRTHDATE_DAY: 'start-age-visit',
  MIN_BIRTHDATE_MONTH: 'start-age-visit-month',
  ENTRYMODE: 'admission-mode',
  EXITMODE: 'discharge-disposition-mode',
  PRISENCHARGETYPE: 'class',
  TYPEDESEJOUR: 'stay',
  ADMISSIONMODE: 'reason-code',
  REASON: 'admission-destination-type',
  DESTINATION: 'discharge-disposition',
  PROVENANCE: 'admit-source',
  ADMISSION: 'admission-type',
  SERVICE_PROVIDER: encounterCareSite,
  STATUS: 'status',
  START_DATE: 'period-start',
  END_DATE: 'period-end'
}

export const DocumentsParamsKeys = {
  IPP: 'subject.identifier',
  DOC_STATUSES: 'docstatus',
  DOC_TYPES: 'type',
  ONLY_PDF_AVAILABLE: 'onlyPdfAvailable',
  NDA: 'encounter.identifier',
  DATE: 'date',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status'
}

export const ConditionParamsKeys = {
  NDA: 'encounter.identifier',
  CODE: 'code',
  DIAGNOSTIC_TYPES: 'orbis-status',
  DATE: 'recorded-date',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  SOURCE: '_source',
  ENCOUNTER_STATUS: 'encounter.status',
  IPP: 'subject.identifier'
}

export const ProcedureParamsKeys = {
  NDA: 'encounter.identifier',
  CODE: 'code',
  SOURCE: '_source',
  DATE: 'date',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status',
  IPP: 'subject.identifier'
}

export const ClaimParamsKeys = {
  NDA: 'encounter.identifier',
  CODE: 'diagnosis',
  DATE: 'created',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status',
  IPP: 'patient.identifier'
}

export const PrescriptionParamsKeys = {
  NDA: 'encounter.identifier',
  PRESCRIPTION_TYPES: 'category',
  IPP: 'subject.identifier',
  DATE: 'validity-period-start',
  END_DATE: 'validity-period-end',
  CODE: 'code',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status',
  PRESCRIPTION_ROUTES: 'dosage-instruction-route'
}

export const AdministrationParamsKeys = {
  NDA: 'context.identifier',
  IPP: 'subject.identifier',
  ADMINISTRATION_ROUTES: 'dosage-route',
  DATE: 'effective-time',
  CODE: 'code',
  EXECUTIVE_UNITS: `context.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'context.status'
}

export const ObservationParamsKeys = {
  NDA: 'encounter.identifier',
  VALIDATED_STATUS: 'status',
  DATE: 'date',
  VALUE: 'value-quantity',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status',
  IPP: 'subject.identifier',
  CODE: 'code'
}

export const ImagingParamsKeys = {
  BODYSITE: 'bodysite',
  IPP: 'patient.identifier',
  MODALITY: 'modality',
  NDA: 'encounter.identifier',
  DATE: 'started',
  STUDY_DESCRIPTION: 'description',
  STUDY_PROCEDURE: 'procedureCode',
  NB_OF_SERIES: 'numberOfSeries',
  NB_OF_INS: 'numberOfInstances',
  WITH_DOCUMENT: 'with-document',
  STUDY_UID: 'identifier',
  SERIES_DATE: 'series-started',
  SERIES_DESCRIPTION: 'series-description',
  SERIES_PROTOCOL: 'series-protocol',
  SERIES_MODALITIES: 'series-modality',
  SERIES_UID: 'series',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status'
}

export const QuestionnaireResponseParamsKeys = {
  NAME: 'questionnaire.name',
  DATE: 'authored',
  EXECUTIVE_UNITS: `encounter.${encounterCareSite}`,
  ENCOUNTER_STATUS: 'encounter.status',
  IPP: 'subject.identifier'
}

export enum FormParamsKeys {
  FORM_NAME = 'questionnaire.name',
  IPP = 'subject.identifier',
  DATE = 'authored',
  EXECUTIVE_UNITS = 'encounter.encounter-care-site',
  ENCOUNTER_STATUS = 'encounter.status'
}

export enum CriteriaType {
  REQUEST = 'Request',
  IPP_LIST = 'IPPList',
  PATIENT = 'Patient',
  ENCOUNTER = 'Encounter',
  DOCUMENTS = 'DocumentReference',
  PMSI = 'pmsi',
  CONDITION = 'Condition',
  PROCEDURE = 'Procedure',
  CLAIM = 'Claim',
  MEDICATION = 'Medication',
  MEDICATION_REQUEST = 'MedicationRequest',
  MEDICATION_ADMINISTRATION = 'MedicationAdministration',
  BIO_MICRO = 'biologie_microbiologie',
  OBSERVATION = 'Observation',
  MICROBIOLOGIE = 'microbiologie',
  PHYSIOLOGIE = 'physiologie',
  IMAGING = 'ImagingStudy',
  SPECIALITY = 'Speciality',
  QUESTIONNAIRE_RESPONSE = 'QuestionnaireResponse',
  MATERNITY = 'Maternity',
  PREGNANCY = 'Pregnancy',
  HOSPIT = 'Hospit'
}

export type SelectedCriteriaType =
  | IPPListDataType
  | ObservationDataType
  | CcamDataType
  | Cim10DataType
  | DemographicDataType
  | DocumentDataType
  | EncounterDataType
  | GhmDataType
  | HospitDataType
  | ImagingDataType
  | MedicationDataType
  | PregnancyDataType

export type PatientAge = {
  minAge?: string // with the format {year}-{month}-{day}, eg. for someone of 21 years old this would be 21-0-0
  maxAge?: string // with the format {year}-{month}-{day}, eg. for someone of 21 years old this would be 21-0-0
}

export type RequeteurCriteriaType = {
  // CRITERIA
  _type: string
  _id: number
  name: string
  isInclusive: boolean
  resourceType: ResourceType
  filterFhir: string
  patientAge?: PatientAge
  occurrence?: {
    n?: number | null
    operator?: Comparators
    timeDelayMin?: number
    timeDelayMax?: number
  }
}

export enum Comparators {
  LESS_OR_EQUAL = '<=',
  LESS = '<',
  EQUAL = '=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  BETWEEN = '≤x≥'
}

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}

// Update the config dynamically
onUpdateConfig((config) => {
  const encounterCareSite = hasSearchParam(ResourceType.ENCOUNTER, 'encounter-care-site', config)
    ? 'encounter-care-site'
    : 'service-provider'

  EncounterParamsKeys.SERVICE_PROVIDER = encounterCareSite
  DocumentsParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  ConditionParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  ProcedureParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  ClaimParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  PrescriptionParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  AdministrationParamsKeys.EXECUTIVE_UNITS = `context.${encounterCareSite}`
  ObservationParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  ImagingParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
  QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS = `encounter.${encounterCareSite}`
})
