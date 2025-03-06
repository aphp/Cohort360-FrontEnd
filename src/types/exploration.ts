import { PatientState } from 'state/patient'
import { ResourceType } from './requestCriterias'
import { Filters, LabelObject, OrderBy, SearchBy, SearchByTypes, SearchCriterias } from './searchCriterias'
import { Reference, Questionnaire } from 'fhir/r4'
import { SourceType } from './scope'

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
  PATIENTS = 'patients',
  COHORT = 'cohort',
  PERIMETERS = 'perimeters',
  NEW_COHORT = 'new_cohort'
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