import { ScopeTreeRow, ValueSetSystem } from 'types'
import { DurationRangeType, GenderStatus, LabelObject, SearchByTypes } from './searchCriterias'

export enum MedicationType {
  Request = 'MedicationRequest',
  Administration = 'MedicationAdministration'
}

export enum MedicationTypeLabel {
  Request = 'Prescription',
  Administration = 'Administration'
}

export type LabelCriteriaObject = {
  id: string
  label: string
  system?: ValueSetSystem
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
  PHYSIOLOGIE = 'physiologie'
}

export type SelectedCriteriaType = {
  id: number
  error?: boolean
  encounterService?: ScopeTreeRow[]
} & (
  | CcamDataType
  | Cim10DataType
  | DemographicDataType
  | GhmDataType
  | EncounterDataType
  | DocumentDataType
  | MedicationDataType
  | ObservationDataType
  | IPPListDataType
  | EncounterDataType
)

export type CcamDataType = {
  title: string
  type: RessourceType.PROCEDURE
  hierarchy: undefined
  code: LabelObject[] | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  label: undefined
  startOccurrence: string | null
  endOccurrence: string | null
  isInclusive?: boolean
}

export type Cim10DataType = {
  title: string
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
  isInclusive?: boolean
}

export type DemographicDataType = {
  title: string
  type: RessourceType.PATIENT
  genders: GenderStatus[] | null
  vitalStatus: LabelObject[] | null
  age: DurationRangeType
  birthdates: DurationRangeType
  deathDates: DurationRangeType
  isInclusive?: boolean
}

export type IPPListDataType = {
  title: string
  type: RessourceType.IPP_LIST
  search: string
  isInclusive?: boolean
}

export type DocType = {
  code: string
  label: string
  type: string
}

export type DocumentDataType = {
  title: string
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
  isInclusive?: boolean
}

export type GhmDataType = {
  title: string
  type: RessourceType.CLAIM
  code: LabelObject[] | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  label: undefined
  startOccurrence: string | null
  endOccurrence: string | null
  isInclusive?: boolean
}
export enum Comparators {
  LESS_OR_EQUAL = '<=',
  LESS = '<',
  EQUAL = '=',
  GREATER = '>',
  GREATER_OR_EQUAL = '>=',
  BETWEEN = '<x>'
}

export type EncounterDataType = {
  type: RessourceType.ENCOUNTER
  title: string
  age: DurationRangeType
  duration: DurationRangeType
  admissionMode: LabelObject[] | null
  entryMode: LabelObject[] | null
  exitMode: LabelObject[] | null
  priseEnChargeType: LabelObject[] | null
  typeDeSejour: LabelObject[] | null
  fileStatus: LabelObject[] | null
  discharge: LabelObject[] | null
  reason: LabelObject[] | null
  destination: LabelObject[] | null
  provenance: LabelObject[] | null
  admission: LabelObject[] | null
  encounterService: ScopeTreeRow[] | null
  encounterStartDate: string | null
  encounterEndDate: string | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
  isInclusive?: boolean
}

export type MedicationDataType = {
  title: string
  code: LabelObject[] | null
  prescriptionType: LabelObject[] | null
  administration: LabelObject[] | null
  occurrence: number
  occurrenceComparator: Comparators
  startOccurrence: string | null
  endOccurrence: string | null
  encounterEndDate: string | null
  encounterStartDate: string | null
  isInclusive?: boolean
} & (
  | {
      type: RessourceType.MEDICATION_REQUEST
      prescriptionType: LabelObject[] | null
    }
  | { type: RessourceType.MEDICATION_ADMINISTRATION }
)

export type ObservationDataType = {
  title: string
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
  isInclusive?: boolean
  encounterStartDate: string | null
  encounterEndDate: string | null
}

export enum VitalStatusLabel {
  ALIVE = 'Vivant(e)',
  DECEASED = 'Décédé(e)',
  ALL = 'Tous les patients'
}
