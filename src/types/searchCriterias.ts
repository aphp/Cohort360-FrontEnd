import { ScopeElement, SimpleCodeType, ValueSet } from 'types'
import { PatientTableLabels } from './patient'
import { CohortsType } from './cohorts'
import { ResourceType } from './requestCriterias'
import { Hierarchy } from './hierarchy'
import { FhirItem } from './valueSet'

export enum FormNames {
  PREGNANCY = 'APHPEDSQuestionnaireFicheGrossesse',
  HOSPIT = 'APHPEDSQuestionnaireFicheHospitalisation',
  UNKNOWN = 'Inconnu'
}

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

export function mapGenderStatusToGenderCodes(status: GenderStatus): GenderCodes {
  switch (status) {
    case GenderStatus.MALE:
      return GenderCodes.MALE
    case GenderStatus.FEMALE:
      return GenderCodes.FEMALE
    case GenderStatus.OTHER:
    case GenderStatus.OTHER_UNKNOWN:
      return GenderCodes.OTHER
    case GenderStatus.UNKNOWN:
      return GenderCodes.UNKNOWN
    default:
      return GenderCodes.NOT_SPECIFIED
  }
}

export function mapGenderCodesToGenderStatus(code: GenderCodes): GenderStatus {
  switch (code) {
    case GenderCodes.MALE:
      return GenderStatus.MALE
    case GenderCodes.FEMALE:
      return GenderStatus.FEMALE
    case GenderCodes.OTHER:
      return GenderStatus.OTHER
    case GenderCodes.UNKNOWN:
      return GenderStatus.UNKNOWN
    case GenderCodes.UNDETERMINED:
    case GenderCodes.NOT_SPECIFIED:
    default:
      return GenderStatus.OTHER_UNKNOWN
  }
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

export const genderOptions = [
  {
    id: GenderStatus.FEMALE,
    label: GenderStatusLabel.FEMALE
  },
  {
    id: GenderStatus.MALE,
    label: GenderStatusLabel.MALE
  },
  {
    id: GenderStatus.OTHER,
    label: GenderStatusLabel.OTHER
  },
  {
    id: GenderStatus.UNKNOWN,
    label: GenderStatusLabel.UNKNOWN
  }
]

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

export const vitalStatusesOptions = [
  {
    id: VitalStatus.ALIVE,
    label: VitalStatusLabel.ALIVE
  },
  {
    id: VitalStatus.DECEASED,
    label: VitalStatusLabel.DECEASED
  }
]

export enum Direction {
  ASC = 'asc',
  DESC = 'desc'
}
export enum DirectionLabel {
  ASC = 'Croissant',
  DESC = 'Décroissant'
}
export enum Order {
  AGE_MONTH = 'age-month',
  AUTHORED = 'authored',
  LABEL = 'label',
  CODE = 'code',
  RESULT_SIZE = 'result_size',
  RECORDED_DATE = 'recorded-date',
  FAMILY = 'family',
  DATE = 'date',
  CREATED = 'created',
  DIAGNOSIS = 'diagnosis',
  ANABIO = 'code-anabio',
  TYPE = 'type-name',
  LASTNAME = 'lastname',
  BIRTHDATE = 'birthdate',
  CREATED_AT = 'created_at',
  DESCRIPTION = 'description',
  EFFECTIVE_TIME = 'effective-time',
  ENCOUNTER = 'encounter',
  FAVORITE = 'favorite',
  GENDER = 'gender',
  ID = 'id',
  IPP = 'identifier',
  LOINC = 'code-loinc',
  MEDICATION_ATC = 'medication-atc',
  MEDICATION_UCD = 'medication-ucd',
  MODALITY = 'modality',
  MODIFIED = 'modified_at',
  NAME = 'name',
  PARENT_FOLDER = 'parent_folder',
  PERIOD_START = 'Period-start',
  PRESCRIPTION_TYPES = 'category-name',
  PROCEDURE = 'procedureCode',
  STUDY_DATE = 'started',
  SUBJECT_IDENTIFIER = 'subject-identifier',
  REQUEST = 'request',
  UPDATED = 'updated_at',
  ADMINISTRATION_MODE = 'route',
  DISPLAY = 'display',
  STATUS = 'status',
  OUTPUT_FORMAT = 'output_format'
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
export enum FilterByDocumentStatus {
  VALIDATED = 'Validé',
  NOT_VALIDATED = 'Non validé'
}
export enum DocumentStatuses {
  FINAL = 'final',
  PRELIMINARY = 'preliminary'
}

export function mapDocumentStatusesToRequestParam(docStatus: string): string {
  return docStatus === FilterByDocumentStatus.VALIDATED
    ? DocumentStatuses.FINAL
    : docStatus === FilterByDocumentStatus.NOT_VALIDATED
    ? DocumentStatuses.PRELIMINARY
    : ''
}

export function mapDocumentStatusesFromRequestParam(docStatus: string): string {
  return docStatus === DocumentStatuses.FINAL
    ? FilterByDocumentStatus.VALIDATED
    : docStatus === DocumentStatuses.PRELIMINARY
    ? FilterByDocumentStatus.NOT_VALIDATED
    : ''
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
  DIAGNOSTIC_TYPES = 'diagnosticTypes',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  ONLY_PDF_AVAILABLE = 'onlyPdfAvailable',
  SOURCE = 'source',
  EXECUTIVE_UNITS = 'executiveUnits',
  DOC_TYPES = 'docTypes',
  DOC_STATUSES = 'docStatuses',
  FAVORITE = 'favorite',
  STATUS = 'status',
  MIN_PATIENTS = 'minPatients',
  MAX_PATIENTS = 'maxPatients',
  MODALITY = 'modality',
  FORM_NAME = 'formName',
  ENCOUNTER_STATUS = 'encounterStatus'
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

// TODO replace this by NewDurationRangeType, this will need the refacto of filters (with a more generic CriteriaForm)
export type DurationRangeType = [string | null | undefined, string | null | undefined]
export type LabelObject = {
  id: string
  label: string
  system?: string
  isLeaf?: boolean
  type?: string
}
export interface OrderBy {
  orderBy: Order
  orderDirection: Direction
}
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
  | Hierarchy<ScopeElement>
  | Hierarchy<ScopeElement>[]
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
  | MaternityFormFilters

export type GenericFilter = {
  nda: string
  startDate: string | null
  endDate: string | null
  executiveUnits: Hierarchy<ScopeElement>[]
  encounterStatus: LabelObject[]
}

export type PatientsFilters = {
  genders: GenderStatus[]
  birthdatesRanges: DurationRangeType
  vitalStatuses: VitalStatus[]
}

export type PMSIFilters = GenericFilter & {
  diagnosticTypes?: LabelObject[]
  code: Hierarchy<FhirItem>[]
  source?: string
  ipp?: string
}

export type MedicationFilters = GenericFilter & {
  prescriptionTypes?: LabelObject[]
  administrationRoutes?: LabelObject[]
  ipp?: string
  code: Hierarchy<FhirItem>[]
}

export type BiologyFilters = GenericFilter & {
  code: Hierarchy<FhirItem>[]
  validatedStatus: boolean
  ipp?: string
}

export type ImagingFilters = GenericFilter & {
  ipp?: string
  modality: LabelObject[]
}

export type MaternityFormFilters = {
  formName: FormNames[]
  startDate: string | null
  endDate: string | null
  encounterStatus: LabelObject[]
  executiveUnits: Hierarchy<ScopeElement>[]
  ipp?: string
}

export type DocumentsFilters = GenericFilter & {
  ipp?: string
  docTypes: SimpleCodeType[]
  docStatuses: LabelObject[]
  onlyPdfAvailable: boolean
}

export interface CohortsFilters {
  status: ValueSet[]
  favorite: CohortsType[]
  minPatients?: null | string
  maxPatients?: null | string
  startDate?: null | string
  endDate?: null | string
}

export type ProjectsFilters = {
  startDate: null | string
  endDate: null | string
}

export interface SearchCriterias<F> {
  searchBy?: SearchByTypes
  searchInput: string
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
export type ActionSearchInput = Action<ActionTypes.CHANGE_SEARCH_INPUT, string>
export type ActionSearchBy = Action<ActionTypes.CHANGE_SEARCH_BY, SearchByTypes>
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
    id: Order.NAME,
    label: PatientTableLabels.NAME
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
  fhir_resource: ResourceType
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
