import { ScopeTreeRow } from 'types'
import { DocumentAttachmentMethod, DurationRangeType, LabelObject, SearchByTypes } from './searchCriterias'

export enum MedicationType {
  Request = 'MedicationRequest',
  Administration = 'MedicationAdministration'
}

export enum MedicationTypeLabel {
  Request = 'Prescription',
  Administration = 'Administration'
}

export enum RessourceType {
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
  IMAGING = 'ImagingStudy'
}

export enum RessourceTypeLabels {
  REQUEST = 'Mes requềtes',
  IPP_LIST = "Liste d'IPP",
  PATIENT = 'Démographie',
  ENCOUNTER = 'Prise en charge',
  DOCUMENTS = 'Documents cliniques',
  PMSI = 'PMSI',
  CONDITION = 'Diagnostics',
  PROCEDURE = 'Actes',
  CLAIM = 'GHM',
  MEDICATION = 'Médicaments',
  BIO_MICRO = 'Biologie/Microbiologie',
  OBSERVATION = 'Biologie',
  MICROBIOLOGIE = 'Microbiologie',
  PHYSIOLOGIE = 'Physiologie',
  IMAGING = 'Imagerie'
}

export type CommonCriteriaDataType = {
  id: number
  error?: boolean
  type: RessourceType
  encounterService?: ScopeTreeRow[]
  isInclusive?: boolean
  title: string
}

export type SelectedCriteriaType =
  | CcamDataType
  | Cim10DataType
  | DemographicDataType
  | GhmDataType
  | EncounterDataType
  | DocumentDataType
  | MedicationDataType
  | ObservationDataType
  | IPPListDataType
  | ImagingDataType

export type DraftSelectedCriteriaType = SelectedCriteriaType & {
  id?: number
}

export enum CriteriaDataKey {
  GENDER = 'gender',
  VITALSTATUS = 'status',
  PRISE_EN_CHARGE_TYPE = 'priseEnChargeType',
  TYPE_DE_SEJOUR = 'typeDeSejour',
  FILE_STATUS = 'fileStatus',
  ADMISSION_MODE = 'admissionModes',
  ADMISSION = 'admission',
  ENTRY_MODES = 'entryModes',
  EXIT_MODES = 'exitModes',
  REASON = 'reason',
  DESTINATION = 'destination',
  PROVENANCE = 'provenance',
  CIM_10_DIAGNOSTIC = 'cim10Diagnostic',
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  CCAM_DATA = 'ccamData',
  GHM_DATA = 'ghmData',
  MEDICATION_DATA = 'medicationData',
  PRESCRIPTION_TYPES = 'prescriptionTypes',
  ADMINISTRATIONS = 'administrations',
  BIOLOGY_DATA = 'biologyData',
  MODALITIES = 'modalities',
  DOC_TYPES = 'docTypes',
  STATUS_DIAGNOSTIC = 'statusDiagnostic'
}

export type CcamDataType = CommonCriteriaDataType & {
  type: RessourceType.PROCEDURE
  hierarchy: undefined
  code: LabelObject[] | null
  source: string
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  label: undefined
  startOccurrence: string | null
  endOccurrence: string | null
}

export type Cim10DataType = CommonCriteriaDataType & {
  type: RessourceType.CONDITION
  code: LabelObject[] | null
  diagnosticType: LabelObject[] | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  label: undefined
  startOccurrence: string | null
  endOccurrence: string | null
}

export type DemographicDataType = CommonCriteriaDataType & {
  type: RessourceType.PATIENT
  genders: LabelObject[] | null
  vitalStatus: LabelObject[] | null
  age: DurationRangeType
  birthdates: DurationRangeType
  deathDates: DurationRangeType
}

export type IPPListDataType = CommonCriteriaDataType & {
  type: RessourceType.IPP_LIST
  search: string
}

export type DocType = {
  code: string
  label: string
  type: string
}

export type DocumentDataType = CommonCriteriaDataType & {
  type: RessourceType.DOCUMENTS
  search: string
  searchBy: SearchByTypes.TEXT | SearchByTypes.DESCRIPTION
  docType: DocType[] | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
}

export type GhmDataType = CommonCriteriaDataType & {
  type: RessourceType.CLAIM
  code: LabelObject[] | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  label: undefined
  startOccurrence: string | null
  endOccurrence: string | null
}
export enum Comparators {
  LESS_OR_EQUAL = '<=',
  LESS = '<',
  EQUAL = '=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  BETWEEN = '<x>'
}

export type EncounterDataType = CommonCriteriaDataType & {
  type: RessourceType.ENCOUNTER
  age: DurationRangeType
  duration: DurationRangeType
  admissionMode: LabelObject[] | null
  entryMode: LabelObject[] | null
  exitMode: LabelObject[] | null
  priseEnChargeType: LabelObject[] | null
  typeDeSejour: LabelObject[] | null
  fileStatus: LabelObject[] | null
  reason: LabelObject[] | null
  destination: LabelObject[] | null
  provenance: LabelObject[] | null
  admission: LabelObject[] | null
  encounterService: ScopeTreeRow[] | null
  encounterStartDate?: string | null
  encounterEndDate?: string | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence?: string
  endOccurrence?: string
}

export type MedicationDataType = CommonCriteriaDataType & {
  code: LabelObject[] | null
  prescriptionType: LabelObject[] | null
  administration: LabelObject[] | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
  encounterEndDate: string | null
  encounterStartDate: string | null
} & (
    | {
        type: RessourceType.MEDICATION_REQUEST
        prescriptionType: LabelObject[] | null
      }
    | { type: RessourceType.MEDICATION_ADMINISTRATION }
  )

export type ObservationDataType = CommonCriteriaDataType & {
  type: RessourceType.OBSERVATION
  code: LabelObject[] | null
  isLeaf: boolean
  valueMin?: number
  valueMax?: number
  valueComparator: Comparators
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
  encounterStartDate: string | null
  encounterEndDate: string | null
}

export type ImagingDataType = CommonCriteriaDataType & {
  type: RessourceType.IMAGING
  studyStartDate: string | null
  studyEndDate: string | null
  studyModalities: LabelObject[] | null
  studyDescription: string
  studyProcedure: string
  numberOfSeries: number
  seriesComparator: Comparators
  numberOfIns: number
  instancesComparator: Comparators
  withDocument: DocumentAttachmentMethod
  daysOfDelay: string | null
  studyUid: string
  seriesStartDate: string | null
  seriesEndDate: string | null
  seriesDescription: string
  seriesProtocol: string
  seriesModalities: LabelObject[] | null
  seriesUid: string
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
}

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}
