import { PatientState } from 'state/patient'
import { ResourceType } from './requestCriterias'
import { Filters, LabelObject, OrderBy, SearchBy, SearchByTypes, SearchCriterias } from './searchCriterias'
import {
  DocumentReference,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4'
import { SourceType } from './scope'
import { Reference } from './valueSet'
import { CohortPMSI, CohortQuestionnaireResponse, ExplorationResults } from 'types'
import { PatientsResponse } from './patient'

export type ResourceOptions<T> = {
  deidentified: boolean
  page: number
  searchCriterias: SearchCriterias<T>
  type?: ResourceType
  groupId: string[]
  patient?: PatientState
  includeFacets?: boolean
}

export enum URLS {
  PATIENTS = 'my-patients',
  COHORT = 'cohort',
  PERIMETERS = 'perimeters',
  PATIENT = 'patients_info'
}

export const GAP = '20px'

export enum DATA_DISPLAY {
  TABLE,
  INFO
}

export type DisplayOptions = {
  myFilters: boolean
  filterBy: boolean
  orderBy: boolean
  saveFilters: boolean
  criterias: boolean
  search: boolean
  diagrams: boolean
  count: boolean
  display: DATA_DISPLAY
}

export const DEFAULT_OPTIONS: DisplayOptions = {
  myFilters: true,
  filterBy: true,
  orderBy: false,
  saveFilters: true,
  criterias: true,
  search: true,
  diagrams: true,
  count: true,
  display: DATA_DISPLAY.TABLE
}

export type SearchWithFilters = Search & {
  filters?: Filters
  orderBy?: OrderBy
}

export type Search = {
  searchInput?: string
  searchBy?: SearchByTypes
}

export type AdditionalInfo = {
  diagnosticTypesList?: LabelObject[]
  encounterStatusList?: LabelObject[]
  references?: Reference[]
  sourceType?: SourceType
  searchByList?: SearchBy[]
  orderByList?: LabelObject[]
  prescriptionList?: LabelObject[]
  administrationList?: LabelObject[]
  questionnaires?: {
    display: LabelObject[]
    raw: Questionnaire[]
  }
  modalities?: LabelObject[]
  type: ResourceType
  deidentified: boolean
}

export type DataType =
  | CohortPMSI
  | Observation
  | ImagingStudy
  | CohortQuestionnaireResponse
  | MedicationRequest
  | MedicationAdministration
  | DocumentReference
  | QuestionnaireResponse

export type Data = PatientsResponse | ExplorationResults<DataType>

export type ExplorationCount = {
  ressource: {
    results: number | null
    total: number | null
  } | null
  patients: {
    results: number | null
    total: number | null
  } | null
}
