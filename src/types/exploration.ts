import { ResourceType } from './requestCriterias'
import { Filters, LabelObject, OrderBy, SearchBy, SearchByTypes, SearchCriterias } from './searchCriterias'
import {
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Meta,
  Observation,
  Patient,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4'
import { SourceType } from './scope'
import { Reference } from './valueSet'
import {
  AgeRepartitionType,
  CohortComposition,
  CohortPMSI,
  CohortQuestionnaireResponse,
  SimpleChartDataType
} from 'types'
import { Table } from './table'
import { Card } from './card'

export type FetchOptions<T> = {
  filters: T
} & Partial<Pick<SearchCriterias<T>, 'searchBy'>>

export type FetchParams = {
  size: number
  page: number
  searchInput: string
  orderBy: OrderBy
  includeFacets: boolean
}

export enum URLS {
  PATIENTS = 'my-patients',
  COHORT = 'cohort',
  PERIMETERS = 'perimeters',
  PATIENT = 'patients_info'
}

export const GAP = '20px'

export type DisplayOptions = {
  myFilters: boolean
  filterBy: boolean
  orderBy: boolean
  saveFilters: boolean
  criterias: boolean
  search: boolean
  diagrams: boolean
  count: boolean
}

export const DISPLAY_OPTIONS: DisplayOptions = {
  myFilters: true,
  filterBy: true,
  orderBy: false,
  saveFilters: true,
  criterias: true,
  search: true,
  diagrams: true,
  count: true
}

export type SearchWithFilters<T> = Search & {
  filters?: T
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
  questionnaires?: LabelObject[]
  modalities?: LabelObject[]
  type: ResourceType
  deidentified: boolean
}

export type DataType =
  | Patient
  | CohortPMSI
  | Observation
  | ImagingStudy
  | CohortQuestionnaireResponse
  | MedicationRequest
  | MedicationAdministration
  | CohortComposition
  | QuestionnaireResponse

export type ExplorationResults<T> = {
  total: number
  totalAllResults: number
  totalPatients: number
  totalAllPatients: number
  meta?: Meta
  list: T[]
}

export type Data = ExplorationResults<DataType>

export type Count = {
  results: number
  total: number
}

export type CountDisplay = [
  { label: string; display: boolean; count: Count },
  { label: string; display: boolean; count: Count }
]

export enum DiagramType {
  BAR,
  PIE,
  PYRAMID
}

export type Diagram = {
  title: string
  type: DiagramType
  data: AgeRepartitionType | SimpleChartDataType[]
}

export type Timeline = {
  data: CohortQuestionnaireResponse[]
  questionnaires: Questionnaire[]
}

export type ExplorationConfig<T extends Filters> = {
  type: ResourceType
  deidentified: boolean
  displayOptions: DisplayOptions
  initSearchCriterias: () => SearchCriterias<T>
  fetchList: (fetchParams: FetchParams, options: FetchOptions<T>, signal?: AbortSignal) => Promise<Data>
  narrowSearchCriterias: (searchCriterias: SearchCriterias<T>) => SearchCriterias<Filters>
  fetchAdditionalInfos: (additionalInfo: AdditionalInfo) => Promise<AdditionalInfo>
  getMessages?: () => string[]
  getCount?: (counts: Count[]) => CountDisplay
  mapToDiagram?: (meta: Meta) => Diagram[]
  mapToTable?: (data: Data, hasSearch?: boolean) => Table
  mapToCards?: (data: Data) => Card[]
  mapToTimeline?: (data: Data) => Promise<{ data: CohortQuestionnaireResponse[]; questionnaires: Questionnaire[] }>
  hasSearchDisplay?: (input: string | undefined, searchBy: SearchByTypes | undefined) => boolean
}
