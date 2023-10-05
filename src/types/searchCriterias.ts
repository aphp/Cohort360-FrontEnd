import { ScopeTreeRow, SimpleCodeType } from 'types'
import { PatientTableLabels } from './patient'

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
  ALIVE = 'alive',
  DECEASED = 'deceased',
  ALL = 'all'
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
  RECORDED_DATE = 'recorded-date',
  FAMILY = 'family',
  DATE = 'date',
  EFFECTIVE_DATETIME = 'effectiveDatetime',
  PERIOD_START = 'Period-start',
  CREATED = 'created',
  DIAGNOSIS = 'diagnosis',
  ANABIO = 'code-anabio',
  LOINC = 'code-loinc',
  TYPE = 'type',
  GENDER = 'gender',
  FIRSTNAME = 'name',
  LASTNAME = 'family',
  BIRTHDATE = 'birthdate',
  IPP = 'identifier'
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
  EXECUTIVE_UNITS = 'executiveUnits',
  DOC_TYPES = 'docTypes'
}

export type SearchBy = SearchByTypes
export type DurationRangeType = [string | null, string | null]
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
  | PatientDocumentsFilters
  | AllDocumentsFilters

export interface PatientsFilters {
  genders: GenderStatus[]
  birthdatesRanges: DurationRangeType
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
  nda: string
  prescriptionTypes: LabelObject[]
  administrationRoutes: LabelObject[]
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
}

export type BiologyFilters = {
  nda: string
  loinc: string
  anabio: string
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
  validatedStatus: boolean
}

export type PatientDocumentsFilters = {
  nda: string
  docTypes: SimpleCodeType[]
  onlyPdfAvailable: boolean
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
}

export type AllDocumentsFilters = {
  nda: string
  ipp: string
  docTypes: SimpleCodeType[]
  onlyPdfAvailable: boolean
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
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
    id: Order.GENDER,
    label: PatientTableLabels.GENDER
  },
  {
    id: Order.FIRSTNAME,
    label: PatientTableLabels.FIRSTNAME
  },
  {
    id: Order.LASTNAME,
    label: PatientTableLabels.LASTNAME
  },
  {
    id: Order.BIRTHDATE,
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
