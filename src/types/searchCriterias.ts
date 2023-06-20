import { ScopeTreeRow } from 'types'

export enum GenderStatus {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
  OTHER_UNKNOWN = 'OTHER_UNKNOWN'
}
export enum GenderStatusLabel {
  MALE = 'Hommes',
  FEMALE = 'Femmes',
  OTHER = 'Autres',
  UNKNOWN = 'Inconnu',
  OTHER_UNKNOWN = 'Autres'
}
export enum VitalStatus {
  ALIVE = 'ALIVE',
  DECEASED = 'DECEASED',
  ALL = 'ALL'
}

export enum VitalStatusLabel {
  ALIVE = 'Patients vivants',
  DECEASED = 'Patients décédés',
  ALL = 'ALL'
}
export enum Direction {
  ASC = 'asc',
  DESC = 'desc'
}
export enum Order {
  CODE = 'code',
  RECORDED_DATE = 'recorded-date',
  FAMILY = 'family',
  DATE = 'date',
  EFFECTIVE_DATETIME = 'effectiveDatetime',
  PERIOD_START = 'Period-start',
  CREATED = 'created',
  DIAGNOSIS = 'diagnosis'
}
export enum SearchByTypes {
  TEXT = '_text',
  FAMILY = 'family',
  GIVEN = 'given',
  IDENTIFIER = 'identifier',
  DESCRIPTION = 'description'
}
export enum SearchByTypesLabel {
  TEXT = 'Tous les champs',
  FAMILY = 'Nom',
  GIVEN = 'Prénom',
  IDENTIFIER = 'IPP',
  DESCRIPTION = 'Description'
}
export enum FilterKeys {
  GENDERS = 'genders',
  VITAL_STATUSES = 'vitalStatuses',
  BIRTHDATES = 'birthdatesRanges',
  CODE = 'code',
  NDA = 'nda',
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  EXECUTIVE_UNITS = 'executiveUnits'
}

export type SearchBy = SearchByTypes
export type DateRange = [string, string]
export type LabelObject = {
  id: string
  label: string
}
export type OrderBy = {
  orderBy: Order
  orderDirection: Direction
}
export type SearchInput = string
export type FilterValue =
  | string
  | string[]
  | LabelObject
  | LabelObject[]
  | DateRange
  | DateRange[]
  | GenderStatus
  | GenderStatus[]
  | VitalStatus
  | VitalStatus[]
  | ScopeTreeRow
  | ScopeTreeRow[]
  | null

export type Filters = PatientsFilters | PMSIFilters | MedicationFilters | BiologyFilters

export interface PatientsFilters {
  genders: GenderStatus[]
  birthdatesRanges: DateRange
  vitalStatuses: VitalStatus[]
}

export type PMSIFilters = {
  nda: string
  diagnosticTypes: LabelObject[]
  code: string
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
}

export type MedicationFilters = {
  nda?: string
  selectedPrescriptionTypes?: LabelObject[]
  selectedAdministrationRoutes?: LabelObject[]
  code?: string
  startDate?: string | null
  endDate?: string | null
  executiveUnits?: ScopeTreeRow[]
}

export type BiologyFilters = {
  nda?: string
  loinc?: string
  anabio?: string
  startDate?: string | null
  endDate?: string | null
  executiveUnits?: ScopeTreeRow[]
}

export type SearchCriterias<F> = {
  searchBy?: SearchBy
  searchInput: SearchInput
  orderBy: OrderBy
  filters: F
}

export type Action<T, P> = {
  type: T
  payload: P
}
export enum ActionTypes {
  CHANGE_ORDER_BY = 'CHANGE_ORDER_BY',
  CHANGE_SEARCH_INPUT = 'CHANGE_SEARCH_INPUT',
  CHANGE_SEARCH_BY = 'CHANGE_SEARCH_BY',
  ADD_FILTERS = 'ADD_FILTERS',
  REMOVE_FILTER = 'REMOVE_FILTER',
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
export type ActionFilters<F> =
  | ActionOrderBy
  | ActionSearchInput
  | ActionSearchBy
  | ActionFilterBy<F>
  | ActionRemoveFilter
  | ActionRemoveSearchCriterias

export const searchByList = [
  {
    id: SearchByTypes.TEXT,
    label: SearchByTypesLabel.TEXT
  },
  {
    id: SearchByTypes.FAMILY,
    label: SearchByTypesLabel.FAMILY
  },
  {
    id: SearchByTypes.GIVEN,
    label: SearchByTypesLabel.GIVEN
  },
  {
    id: SearchByTypes.IDENTIFIER,
    label: SearchByTypesLabel.IDENTIFIER
  }
]
