import { ScopeTreeRow, SimpleCodeType, ValueSet } from 'types'
import { PatientTableLabels } from './patient'
import { CohortsType } from './cohorts'
import { RessourceType } from './requestCriterias'

export enum GenderStatus {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
  OTHER_UNKNOWN = 'OTHER_UNKNOWN'
}
export enum GenderCodes {
  MALE = 'm',
  FEMALE = 'f',
  OTHER = 'a',
  UNKNOWN = 'INCONNU',
  UNDETERMINED = 'i',
  NOT_SPECIFIED = 'NON RENSEIGNE'
}
export enum GenderStatusLabel {
  MALE = 'Hommes',
  FEMALE = 'Femmes',
  OTHER = 'Autres',
  UNKNOWN = 'Inconnu',
  OTHER_UNKNOWN = 'Autres'
}
export enum VitalStatusLabel {
  ALIVE = 'Patients vivants',
  DECEASED = 'Patients décédés',
  ALL = 'Tous les patients'
}

export enum VitalStatusOptions {
  birth = 'birth',
  age = 'age',
  deceasedAge = 'deceasedAge',
  deceasedDate = 'deceasedDate'
}

export enum VitalStatusOptionsLabel {
  birth = 'Date de naissance',
  age = 'Âge actuel',
  deceasedAge = 'Âge au décès',
  deceasedDate = 'Date de décès'
}

export enum VitalStatus {
  ALIVE = 'ALIVE',
  DECEASED = 'DECEASED'
}

export enum Direction {
  ASC = 'asc',
  DESC = 'desc'
}
export enum DirectionLabel {
  ASC = 'Croissant',
  DESC = 'Décroissant'
}
export enum Order {
  CODE = 'code',
  RESULT_SIZE = 'result_size',
  FAVORITE = 'favorite',
  RECORDED_DATE = 'recorded-date',
  FAMILY = 'family',
  DATE = 'date',
  PERIOD_START = 'Period-start',
  CREATED = 'created',
  DIAGNOSIS = 'diagnosis',
  ANABIO = 'code-anabio',
  LOINC = 'code-loinc',
  TYPE = 'type-name',
  GENDER = 'gender',
  FIRSTNAME = 'name',
  LASTNAME = 'lastname',
  BIRTHDATE = 'birthdate',
  IPP = 'identifier',
  ID = 'id',
  MODIFIED = 'modified_at',
  NAME = 'name',
  MODALITY = 'modality',
  DESCRIPTION = 'description',
  PROCEDURE = 'procedureCode',
  STUDY_DATE = 'started',
  CREATED_AT = 'created_at'
}
export enum SearchByTypes {
  TEXT = '_text',
  FAMILY = 'family',
  GIVEN = 'given',
  IDENTIFIER = 'identifier',
  DESCRIPTION = 'description'
}
export enum SearchByTypesLabelPatients {
  TEXT = 'Tous les champs',
  FAMILY = 'Nom',
  GIVEN = 'Prénom',
  IDENTIFIER = 'IPP',
  DESCRIPTION = 'Description'
}
export enum SearchByTypesLabelDocuments {
  TEXT = 'Corps du document',
  DESCRIPTION = 'Titre du document'
}
export enum FilterKeys {
  IPP = 'ipp',
  GENDERS = 'genders',
  VITAL_STATUSES = 'vitalStatuses',
  BIRTHDATES = 'birthdatesRanges',
  ADMINISTRATION_ROUTES = 'administrationRoutes',
  PRESCRIPTION_TYPES = 'prescriptionTypes',
  CODE = 'code',
  NDA = 'nda',
  ANABIO = 'anabio',
  LOINC = 'loinc',
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  ONLY_PDF_AVAILABLE = 'onlyPdfAvailable',
  SOURCE = 'source',
  EXECUTIVE_UNITS = 'executiveUnits',
  DOC_TYPES = 'docTypes',
  FAVORITE = 'favorite',
  STATUS = 'status',
  MIN_PATIENTS = 'minPatients',
  MAX_PATIENTS = 'maxPatients',
  MODALITY = 'modality'
}

export enum OrderByKeys {
  ORDER_BY = 'orderBy',
  ORDER_DIRECTION = 'orderDirection'
}

export enum DocumentAttachmentMethod {
  NONE = 'NONE',
  ACCESS_NUMBER = 'ACCESS_NUMBER',
  INFERENCE_TEMPOREL = 'INFERENCE_TEMPOREL'
}

export enum DocumentAttachmentMethodLabel {
  NONE = 'Aucune',
  ACCESS_NUMBER = "Numéro d'accession",
  INFERENCE_TEMPOREL = 'Inférence temporelle'
}

export type SearchBy = SearchByTypes
export type DurationRangeType = [string | null | undefined, string | null | undefined]
export type LabelObject = {
  id: string
  label: string
  system?: string
}
export interface OrderBy {
  orderBy: Order
  orderDirection: Direction
}
export type SearchInput = string
export type FilterValue =
  | string
  | string[]
  | LabelObject
  | LabelObject[]
  | ValueSet
  | ValueSet[]
  | DurationRangeType
  | DurationRangeType[]
  | GenderStatus
  | GenderStatus[]
  | VitalStatus
  | VitalStatus[]
  | ScopeTreeRow
  | ScopeTreeRow[]
  | SimpleCodeType
  | SimpleCodeType[]
  | null

export type Filters =
  | PatientsFilters
  | PMSIFilters
  | MedicationFilters
  | BiologyFilters
  | DocumentsFilters
  | CohortsFilters
  | ImagingFilters

export type GenericFilter = {
  nda: string
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
}

export interface PatientsFilters {
  genders: GenderStatus[]
  birthdatesRanges: DurationRangeType
  vitalStatuses: VitalStatus[]
}

export type PMSIFilters = GenericFilter & {
  diagnosticTypes?: LabelObject[]
  code: LabelObject[]
  source?: string
}

export type MedicationFilters = GenericFilter & {
  prescriptionTypes?: LabelObject[]
  administrationRoutes?: LabelObject[]
}

export type BiologyFilters = GenericFilter & {
  loinc: LabelObject[]
  anabio: LabelObject[]
  validatedStatus: boolean
}

export type ImagingFilters = GenericFilter & {
  ipp?: string
  modality: LabelObject[]
}

export type DocumentsFilters = GenericFilter & {
  ipp?: string
  docTypes: SimpleCodeType[]
  onlyPdfAvailable: boolean
}
export interface CohortsFilters {
  status: ValueSet[]
  favorite: CohortsType
  minPatients: null | string
  maxPatients: null | string
  startDate: null | string
  endDate: null | string
}

export interface SearchCriterias<F> {
  searchBy?: SearchBy
  searchInput: SearchInput
  orderBy: OrderBy
  filters: F
}

export interface Action<T, P> {
  type: T
  payload: P
}
export enum ActionTypes {
  CHANGE_ORDER_BY = 'CHANGE_ORDER_BY',
  CHANGE_SEARCH_INPUT = 'CHANGE_SEARCH_INPUT',
  CHANGE_SEARCH_BY = 'CHANGE_SEARCH_BY',
  ADD_FILTERS = 'ADD_FILTERS',
  REMOVE_FILTER = 'REMOVE_FILTER',
  ADD_SEARCH_CRITERIAS = 'ADD_SEARCH_CRITERIAS',
  REMOVE_SEARCH_CRITERIAS = 'REMOVE_SEARCH_CRITERIAS'
}

type RemoveFilter = {
  key: FilterKeys
  value: FilterValue
}

export type ActionOrderBy = Action<ActionTypes.CHANGE_ORDER_BY, OrderBy>
export type ActionSearchInput = Action<ActionTypes.CHANGE_SEARCH_INPUT, SearchInput>
export type ActionSearchBy = Action<ActionTypes.CHANGE_SEARCH_BY, SearchBy>
export type ActionFilterBy<F> = Action<ActionTypes.ADD_FILTERS, F>
export type ActionRemoveFilter = Action<ActionTypes.REMOVE_FILTER, RemoveFilter>
export type ActionRemoveSearchCriterias = Action<ActionTypes.REMOVE_SEARCH_CRITERIAS, null>
export type ActionAddSearchCriterias<F> = Action<ActionTypes.ADD_SEARCH_CRITERIAS, SearchCriterias<F>>
export type ActionFilters<F> =
  | ActionOrderBy
  | ActionSearchInput
  | ActionSearchBy
  | ActionFilterBy<F>
  | ActionRemoveFilter
  | ActionRemoveSearchCriterias
  | ActionAddSearchCriterias<F>

export const searchByListPatients = [
  {
    id: SearchByTypes.TEXT,
    label: SearchByTypesLabelPatients.TEXT
  },
  {
    id: SearchByTypes.FAMILY,
    label: SearchByTypesLabelPatients.FAMILY
  },
  {
    id: SearchByTypes.GIVEN,
    label: SearchByTypesLabelPatients.GIVEN
  },
  {
    id: SearchByTypes.IDENTIFIER,
    label: SearchByTypesLabelPatients.IDENTIFIER
  }
]

export const orderByListPatients = [
  {
    id: `${Order.GENDER},${Order.ID}` as Order,
    label: PatientTableLabels.GENDER
  },
  {
    id: Order.FIRSTNAME,
    label: PatientTableLabels.FIRSTNAME
  },
  {
    id: Order.FAMILY,
    label: PatientTableLabels.LASTNAME
  },
  {
    id: `${Order.BIRTHDATE},${Order.ID}` as Order,
    label: PatientTableLabels.BIRTHDATE
  }
]
export const orderByListPatientsDeidentified = [
  {
    id: Order.GENDER,
    label: PatientTableLabels.GENDER
  },
  {
    id: Order.BIRTHDATE,
    label: PatientTableLabels.BIRTHDATE
  }
]

export const searchByListDocuments = [
  {
    id: SearchByTypes.TEXT,
    label: SearchByTypesLabelDocuments.TEXT
  },
  {
    id: SearchByTypes.DESCRIPTION,
    label: SearchByTypesLabelDocuments.DESCRIPTION
  }
]

export const orderDirection = [
  {
    id: Direction.ASC,
    label: DirectionLabel.ASC
  },
  {
    id: Direction.DESC,
    label: DirectionLabel.DESC
  }
]

export type SavedFilter = {
  created_at: string
  deleted: string
  deleted_by_cascade: boolean
  fhir_resource: RessourceType
  fhir_version: string
  filter: string
  modified_at: string
  name: string
  owner: string
  uuid: string
}

export type SavedFiltersResults = {
  count: number
  next: string | null
  previous: string | null
  results: SavedFilter[]
}
