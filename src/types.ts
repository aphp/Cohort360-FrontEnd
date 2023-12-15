import { ReactElement, ReactNode } from 'react'
import {
  Bundle,
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  FhirResource,
  Group,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  OperationOutcome,
  Patient,
  Procedure,
  Resource
} from 'fhir/r4'
import { AxiosResponse } from 'axios'
import { SearchByTypes } from 'types/searchCriterias'
import { SearchInputError } from 'types/error'
import { Comparators, CriteriaDataKey, SelectedCriteriaType } from 'types/requestCriterias'

export enum CohortJobStatus {
  _long_pending = 'long_pending',
  _failed = 'failed',
  _finished = 'finished',
  _pending = 'pending',
  _new = 'new'
}

export enum DocumentReferenceStatusKind {
  _current = 'current',
  _superseded = 'superseded',
  _enteredInError = 'entered-in-error'
}

export enum EncounterStatusKind {
  _planned = 'planned',
  _arrived = 'arrived',
  _triaged = 'triaged',
  _inProgress = 'in-progress',
  _onleave = 'onleave',
  _finished = 'finished',
  _cancelled = 'cancelled',
  _enteredInError = 'entered-in-error',
  _unknown = 'unknown'
}

export enum LoadingStatus {
  FETCHING = 'FETCHING',
  IDDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export enum CompositionStatusKind {
  _preliminary = 'preliminary',
  _final = 'final',
  _amended = 'amended',
  _enteredInError = 'entered-in-error'
}

export enum TemporalConstraintsKind {
  NONE = 'none',
  SAME_ENCOUNTER = 'sameEncounter',
  DIFFERENT_ENCOUNTER = 'differentEncounter',
  PARTIAL_CONSTRAINT = 'partialConstraint',
  DIRECT_CHRONOLOGICAL_ORDERING = 'directChronologicalOrdering'
}

export enum CohortCreationError {
  ERROR_TITLE = 'error_title',
  ERROR_REGEX = 'error_regex'
}

export type FHIR_API_Response<T extends Resource> = T | OperationOutcome
export type FHIR_Bundle_Response<T extends FhirResource> = FHIR_API_Response<Bundle<T>>
export type FHIR_API_Promise_Response<T extends Resource> = Promise<AxiosResponse<FHIR_API_Response<T>>>
export type FHIR_Bundle_Promise_Response<T extends FhirResource> = FHIR_API_Promise_Response<Bundle<T>>

export type Back_API_Response<T> = {
  results?: T[]
  count?: number
}

export type Provider = {
  birth_date?: string
  cdm_source?: string
  delete_datetime?: string
  displayed_name?: string
  email?: string
  firstname?: string
  gender_concept_id?: number
  gender_source_concept_id?: number
  gender_source_value?: string
  insert_datetime?: string
  lastname?: string
  provider_username?: string
  provider_id?: number
  provider_name?: string
  provider_source_value?: string
  specialty_concept_id?: number
  specialty_source_concept_id?: number
  specialty_source_value?: string
  update_datetime?: string
  year_of_birth?: number
}

export type CohortComposition = DocumentReference & {
  deidentified?: boolean
  idPatient?: string
  IPP?: string
  encounterStatus?: string
  serviceProvider?: string
  NDA?: string
  event?: {}
  parameter?: any[]
  title?: string
  encounter?: {
    id?: string
    status?: string
    serviceProvider?: string
    NDA?: string
    event?: {}
    parameter?: any[]
    title?: string
  }[]
}

export type CohortEncounter = Encounter & {
  documents?: CohortComposition[]
  details?: Encounter[]
}

export type CohortPatient = Patient & {
  lastEncounter?: Encounter
  lastProcedure?: Procedure
  mainDiagnosis?: Condition[]
  labResults?: Observation[]
  inclusion?: boolean
  lastGhm?: Claim
  associatedDiagnosis?: Condition[]
  lastLabResults?: Observation
}

export type PMSIEntry<T extends Procedure | Condition | Claim> = T & {
  documents?: CohortComposition[]
  serviceProvider?: string
  NDA?: string
}

export type MedicationEntry<T extends MedicationRequest | MedicationAdministration> = T & {
  documents?: CohortComposition[]
  serviceProvider?: string
  NDA?: string
}

export type SimpleCodeType = { code: string; label: string; type: string }

type GenericFilter = {
  nda: string
  startDate: string | null
  endDate: string | null
  executiveUnits: ScopeTreeRow[]
}

export type DocumentFilters = GenericFilter & {
  ipp?: string
  selectedDocTypes: SimpleCodeType[]
  onlyPdfAvailable: boolean
}

export type MedicationsFilters = GenericFilter & {
  selectedPrescriptionTypes: { id: string; label: string }[]
  selectedAdministrationRoutes: { id: string; label: string }[]
}

export type PMSIFilters = GenericFilter & {
  code: string
  diagnosticTypes: { id: string; label: string }[]
}

export type ObservationFilters = GenericFilter & {
  loinc: string
  anabio: string
}

export type Sort = {
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

export type CohortGroup = Group & {
  id: string
  name: string
  quantity: number
  parentId?: string
  subItems?: CohortGroup[]
}

export enum Month {
  january = 'Janvier',
  february = 'Février',
  march = 'Mars',
  april = 'Avril',
  may = 'Mai',
  june = 'Juin',
  july = 'Juillet',
  august = 'Août',
  september = 'Septembre',
  october = 'Octobre',
  november = 'Novembre',
  december = 'Decembre'
}

export type AbstractTree<T> = T & {
  id: string
  subItems?: AbstractTree<T>[]
}

export type Column =
  | {
      label: string | ReactNode
      code?: string
      align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
      multiple?: undefined
    }
  | {
      multiple: Column[]
    }

export type ScopeTreeRow = AbstractTree<{
  access?: string
  resourceType?: string
  name: string
  full_path?: string
  quantity: number
  parentId?: string | null
  managingEntity?: any | undefined
  above_levels_ids?: string
  inferior_levels_ids?: string
  cohort_id?: string
  cohort_size?: string
  cohort_tag?: string
  type?: string
}>

export enum ChartCode {
  agePyramid = 'facet-extension.ageMonth',
  genderRepartition = 'facet-deceased',
  monthlyVisits = 'facet-_facet.period.startGender',
  visitTypeRepartition = 'facet-class.coding.display'
}

export type SimpleChartDataType = {
  label: string
  value: number
  color: string
  size?: number
}

export type GenderRepartitionType = {
  female: { deceased: number; alive: number }
  male: { deceased: number; alive: number }
  unknown: { deceased: number; alive: number }
  other: { deceased: number; alive: number }
}

export type AgeRepartitionType = { male: number; female: number; other: number }[]

export type MonthVisiteRepartitionType = {
  male: number
  maleCount: number
  female: number
  femaleCount: number
  other: number
  otherCount: number
}

export type VisiteRepartitionType = {
  Janvier: MonthVisiteRepartitionType
  Février: MonthVisiteRepartitionType
  Mars: MonthVisiteRepartitionType
  Avril: MonthVisiteRepartitionType
  Mai: MonthVisiteRepartitionType
  Juin: MonthVisiteRepartitionType
  Juillet: MonthVisiteRepartitionType
  Août: MonthVisiteRepartitionType
  Septembre: MonthVisiteRepartitionType
  Octobre: MonthVisiteRepartitionType
  Novembre: MonthVisiteRepartitionType
  Decembre: MonthVisiteRepartitionType
}

export type CohortData = {
  name?: string
  description?: string
  cohort?: Group | Group[]
  totalPatients?: number
  originalPatients?: CohortPatient[]
  totalDocs?: number
  documentsList?: CohortComposition[]
  wordcloudData?: any
  encounters?: Encounter[]
  genderRepartitionMap?: GenderRepartitionType
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: VisiteRepartitionType
  agePyramidData?: AgeRepartitionType
  requestId?: string
  favorite?: boolean
  uuid?: string
}

export type DocumentsData = {
  totalDocs: number
  totalAllDocs: number
  totalPatientDocs: number
  totalAllPatientDocs: number
  documentsList: DocumentReference[]
}

export type ImagingData = {
  totalImaging: number
  totalAllImaging: number
  imagingList: CohortImaging[]
}

export type PatientData = {
  patient?: CohortPatient
  hospit?: (CohortEncounter | Encounter)[]
  documents?: CohortComposition[]
  documentsTotal?: number
  consult?: PMSIEntry<Procedure>[]
  consultTotal?: number
  diagnostic?: PMSIEntry<Condition>[]
  diagnosticTotal?: number
  ghm?: PMSIEntry<Claim>[]
  ghmTotal?: number
  medicationRequest?: MedicationRequest[]
  medicationRequestTotal?: number
  medicationAdministration?: MedicationAdministration[]
  medicationAdministrationTotal?: number
}

export type CriteriaGroupType = {
  id: number
  title: string
  criteriaIds: number[]
  isSubGroup?: boolean
  isInclusive?: boolean
} & (
  | {
      type: 'andGroup' | 'orGroup'
    }
  | {
      type: 'NamongM'
      options: {
        operator: Comparators
        number: number
        timeDelayMin: number
        timeDelayMax: number
      }
    }
)

export type TemporalConstraintsType = {
  id?: number
  idList: ['All'] | number[]
  constraintType: TemporalConstraintsKind
  timeRelationMinDuration?: {
    years?: number
    months?: number
    days?: number
    hours?: number
  }
  timeRelationMaxDuration?: {
    years?: number
    months?: number
    days?: number
    hours?: number
  }
}

export type CriteriaDrawerComponentProps = {
  parentId: number | null
  criteriaData: CriteriaItemDataCache
  selectedCriteria: SelectedCriteriaType | null
  onChangeSelectedCriteria: (newCriteria: SelectedCriteriaType) => void
  goBack: () => void
}

export type CriteriaItemDataCache = {
  criteriaType: string
  data: { [key in CriteriaDataKey]?: any }
}

export type CriteriaItemType = {
  id: string
  title: string
  color: string
  fontWeight?: string
  components: React.FC<CriteriaDrawerComponentProps> | null
  disabled?: boolean
  fetch?: { [key in CriteriaDataKey]?: (...args: any[]) => Promise<any> }
  subItems?: CriteriaItemType[]
}

export type ValueSet = {
  code: string
  display: string
}

export enum ValueSetSystem {
  ATC = 'ATC',
  UCD = 'UCD'
}

export type ProjectType = {
  uuid: string
  name: string
  description?: string
  created_at?: string
  modified_at?: string
  favorite?: boolean
  owner_id?: string
}

export type RequestType = {
  uuid: string
  owner?: string
  query_snapshots?: QuerySnapshotInfo[]
  shared_by?: Provider
  parent_folder?: string
  deleted?: string
  deleted_by_cascade?: boolean
  created_at?: string
  modified_at?: string
  name: string
  description?: string
  favorite?: boolean
  data_type_of_query?: 'PATIENT' | 'ENCOUNTER'
  currentSnapshot?: Snapshot
  requestId?: string
  requestName?: string
  shared_query_snapshot?: string[]
  usersToShare?: Provider[]
}

export type QuerySnapshotInfo = {
  uuid: string
  created_at: string
  title: string
  has_linked_cohorts: boolean
  version: number
}

export type Snapshot = QuerySnapshotInfo & {
  owner?: string
  request?: string
  previous_snapshot: string | null
  dated_measures: DatedMeasure[]
  cohort_results: Cohort[]
  shared_by?: Provider
  deleted?: boolean
  deleted_by_cascade?: boolean
  modified_at?: string
  serialized_query: string
  is_active_branch?: boolean
  perimeters_ids?: string[]
}

export type CurrentSnapshot = Snapshot & {
  navHistoryIndex: number
}

export type DatedMeasure = {
  uuid: string
  owner: string
  request_query_snapshot: string
  count_outdated: boolean
  cohort_limit: number
  deleted: string | null
  deleted_by_cascade: boolean
  request_job_id: string | null
  request_job_status: string | null
  request_job_fail_msg: string | null
  request_job_duration: string | null
  created_at: string
  modified_at: string
  fhir_datetime: string
  measure: number | null
  measure_min: number | null
  measure_max: number | null
  count_task_id: string
  mode: 'Snapshot' | 'Global'
}

export type Cohort = {
  uuid?: string
  owner?: string
  result_size?: number
  request?: string
  request_query_snapshot?: string
  dated_measure?: DatedMeasure
  dated_measure_global?: DatedMeasure
  global_estimate?: boolean
  fhir_group_id?: string
  exportable?: boolean
  deleted?: string
  deleted_by_cascade?: boolean
  request_job_id?: string
  request_job_status?: string
  request_job_fail_msg?: string
  request_job_duration?: string
  created_at?: string
  modified_at?: string
  name?: string
  description?: string
  favorite?: boolean
  create_task_id?: string
  type?: 'IMPORT_I2B2' | 'MY_ORGANIZATIONS' | 'MY_PATIENTS' | 'MY_COHORTS'
  extension?: any[]
  rights?: GroupRights
}

export type CohortCreationCounterType = {
  uuid?: string
  status?: string
  includePatient?: number
  byrequest?: number
  unknownPatient?: number
  jobFailMsg?: string
  date?: string
  cohort_limit?: number
  count_outdated?: boolean
}

export type ContactSubmitForm = FormData

/**
 * Patient State Types
 */

export type IPatientDetails = Patient & {
  lastEncounter?: Encounter
  lastGhm?: Claim | 'loading'
  lastProcedure?: Procedure | 'loading'
  mainDiagnosis?: Condition[] | 'loading'
}

export type IPatientDocuments = {
  loading: boolean
  count: number
  total: number
  list: CohortComposition[]
  page: number
  options?: {
    filters?: {
      searchInput: string
      nda: string
      selectedDocTypes: string[]
      startDate: string | null
      endDate: string | null
    }
    sort?: {
      by: string
      direction: string
    }
  }
  searchInputError?: SearchInputError
}

export type IPatientPmsi<T extends Procedure | Condition | Claim> = {
  loading: boolean
  count: number
  total: number
  list: T[]
  page: number
  options?: {
    filters?: {
      searchInput: string
      nda: string
      startDate: string | null
      endDate: string | null
      code?: string
      diagnosticTypes?: string[]
    }
    sort?: {
      by: string
      direction: string
    }
  }
}

export type CohortMedication<T extends MedicationRequest | MedicationAdministration> = T & {
  serviceProvider?: string
  NDA?: string
}

export type IPatientMedication<T extends MedicationRequest | MedicationAdministration> = {
  loading: boolean
  count: number
  total: number | null
  list: T[]
  page: number
  options?: {
    filters?: {
      searchInput: string
      nda: string
      startDate: string | null
      endDate: string | null
      code?: string
      selectedPrescriptionTypes?: { id: string; label: string }[]
      selectedAdministrationRoutes?: { id: string; label: string }[]
    }
    sort?: {
      by: string
      direction: string
    }
  }
}

export enum BiologyStatus {
  VALIDATED = 'Val'
}

export type CohortObservation = Observation & {
  serviceProvider?: string
  NDA?: string
}

export type IPatientObservation<T extends CohortObservation> = {
  loading: boolean
  count: number
  total: number
  list: T[]
  page: number
  options?: {
    filters?: {
      searchInput: string
      nda: string
      loinc: string
      anabio: string
      startDate: string | null
      endDate: string | null
    }
    sort?: {
      by: string
      direction: string
    }
  }
}

export type CohortImaging = ImagingStudy & {
  idPatient?: string
  serviceProvider?: string
  NDA?: string
  IPP?: string
}
export type IPatientImaging<T extends CohortImaging> = {
  loading: boolean
  count: number
  total: number
  list: T[]
  page: number
}

export type TabType<T, TL> = {
  label: TL
  id: T
  icon?: ReactElement
  wrapped?: boolean
}

export type DTTB_ResultsType = {
  nb: number
  total: number
  label?: string
}
export type DTTB_SearchBarType = {
  type: 'simple' | 'patient' | 'document'
  value: string | undefined
  onSearch: (newSearch: string, newSearchBy: SearchByTypes) => void
  searchBy?: any
  error?: SearchInputError
  fullWidth?: boolean
}
export type DTTB_ButtonType = {
  label: string
  icon?: ReactElement
  onClick: (args?: any) => void
}
export type HierarchyTree = null | {
  code?: HierarchyElement[]
  loading?: number
}
export type HierarchyElement<E = {}> = E & {
  id: string
  label: string
  subItems?: HierarchyElement[]
}

export type HierarchyElementWithSystem = HierarchyElement<{ system?: string }>

export type TreeElement = { id: string; subItems: TreeElement[] }
export type ScopeElement = {
  id: number
  name: string
  source_value: string
  parent_id: string | null
  type: string
  above_levels_ids: string
  inferior_levels_ids: string
  cohort_id: string
  cohort_size: string
  full_path: string
}
export type ScopePage = {
  perimeter: ScopeElement
  read_role: string
  right_read_patient_nominative: boolean
  right_read_patient_pseudonymized: boolean
  right_search_patients_by_ipp: boolean
  read_access?: string
  read_export?: string
}
export type IScope = {
  count: number
  next: string | null
  previous: string | null
  results: ScopePage[]
}

export type GroupRights = {
  export_csv_nomi?: boolean
  export_csv_pseudo?: boolean
  export_jupyter_nomi?: boolean
  export_jupyter_pseudo?: boolean
  read_patient_nomi?: boolean
  read_patient_pseudo?: boolean
}

export type DataRights = {
  user_id: string
  perimeter_id: number
  right_read_patient_nominative: boolean
  right_read_patient_pseudonymized: boolean
  right_export_csv_nominative: boolean
  right_export_csv_pseudonymized: boolean
  right_export_jupyter_nominative: boolean
  right_export_jupyter_pseudonymized: boolean
  right_search_opposed_patients: boolean
  right_search_patients_by_ipp: boolean
}

export type ScopeType =
  | 'AP-HP'
  | 'Groupe hospitalier (GH)'
  | 'GHU'
  | 'Hôpital'
  | 'Pôle/DMU'
  | 'Unité Fonctionnelle (UF)'

export enum CriteriaName {
  Cim10 = 'cim10',
  Ccam = 'ccam',
  Ghm = 'ghm',
  Document = 'document',
  Medication = 'medication',
  Biology = 'biology',
  VisitSupport = 'supported',
  Imaging = 'imaging'
}
export type CriteriaNameType =
  | CriteriaName.Cim10
  | CriteriaName.Ccam
  | CriteriaName.Ghm
  | CriteriaName.Document
  | CriteriaName.Medication
  | CriteriaName.Biology
  | CriteriaName.VisitSupport
  | CriteriaName.Imaging

export type AccessExpirationsProps = {
  expiring?: boolean
}

export type SimpleStatus = 'success' | 'error' | null

export type AccessExpiration = {
  leftDays?: number
  start_datetime: Date
  end_datetime: Date
  profile: string
  perimeter: string
}

export type ExpandScopeElementParamsType = {
  rowId: number
  scopesList?: ScopeListType
  selectedItems?: ScopeTreeRow[]
  openPopulation?: number[]
  executiveUnitType?: ScopeType
  isExecutiveUnit?: boolean
  signal?: AbortSignal
}
export type ExpandScopeElementReturnType = {
  scopesList: ScopeListType
  selectedItems: ScopeTreeRow[]
  openPopulation: number[]
  aborted?: boolean
}

export type ScopeTreeTableHeadCellsType = {
  id: string
  align: string
  disablePadding: boolean
  disableOrderBy: boolean
  label: string | ReactElement
}

export type ScopeListType = {
  perimeters: ScopeTreeRow[]
  executiveUnits: ScopeTreeRow[]
}
