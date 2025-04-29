import { ReactElement, ReactNode } from 'react'
import {
  Bundle,
  Claim,
  Condition,
  DiagnosticReport,
  DocumentReference,
  Encounter,
  Extension,
  FhirResource,
  Group,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  OperationOutcome,
  Parameters,
  Patient,
  Period,
  Procedure,
  QuestionnaireResponse,
  Resource
} from 'fhir/r4'
import { AxiosResponse } from 'axios'
import { SearchInputError } from 'types/error'
import {
  Comparators,
  CriteriaType,
  MedicationLabel,
  PMSIResourceTypes,
  ResourceType,
  SelectedCriteriaType
} from 'types/requestCriterias'
import { ExportTableType } from 'components/Dashboard/ExportModal/export_table'
import { SearchByTypes } from 'types/searchCriterias'
import { PMSILabel } from 'types/patient'
import { CriteriaForm } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/types'

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export enum JobStatus {
  NEW = 'new',
  PENDING = 'pending',
  LONG_PENDING = 'long_pending',
  STARTED = 'started',
  FAILED = 'failed',
  FINISHED = 'finished',
  SUSPENDED = 'suspended',
  ACCEPTED = 'accepted'
}

export enum LoadingStatus {
  FETCHING = 'FETCHING',
  IDDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export enum TemporalConstraintsKind {
  NONE = 'none',
  SAME_ENCOUNTER = 'sameEncounter',
  DIFFERENT_ENCOUNTER = 'differentEncounter',
  PARTIAL_CONSTRAINT = 'partialConstraint',
  DIRECT_CHRONOLOGICAL_ORDERING = 'directChronologicalOrdering',
  SAME_EPISODE_OF_CARE = 'sameEpisodeOfCare',
  DIFFERENT_EPISODE_OF_CARE = 'differentEpisodeOfCare',
  PARTIAL_EPISODE_CONSTRAINT = 'partialEpisodeConstraint'
}

export enum CohortCreationError {
  ERROR_TITLE = 'error_title',
  ERROR_REGEX = 'error_regex'
}

export type Authentication = Token & {
  user: User
  last_login: string
}

export type Token = {
  access_token: string
  refresh_token: string
}

export type MaintenanceInfo = {
  id: string
  insert_datetime: string
  update_datetime: string
  delete_datetime: string
  start_datetime: string
  end_datetime: string
  maintenance_start: string
  maintenance_end: string
  active: boolean
  subject: string
  type: string
  message: string
}

export type FHIR_API_Response<T extends Resource> = T | OperationOutcome
export type FHIR_Bundle_Response<T extends FhirResource> = FHIR_API_Response<Bundle<T>>
export type FHIR_API_Promise_Response<T extends Resource> = Promise<AxiosResponse<FHIR_API_Response<T>>>
export type FHIR_Bundle_Promise_Response<T extends FhirResource> = FHIR_API_Promise_Response<Bundle<T>>

export type Back_API_Response<T> = {
  results: T[]
  next?: string
  previous?: string
  count: number
}

export type User = {
  username?: string
  email?: string
  firstname?: string
  lastname?: string
  display_name?: string
}

export type CohortComposition = DocumentReference & {
  deidentified?: boolean
  idPatient?: string
  IPP?: string
  encounterStatus?: string
  serviceProvider?: string
  NDA?: string
  event?: {}
  parameter?: Parameters[]
  title?: string
  encounter?: {
    id?: string
    status?: string
    serviceProvider?: string
    NDA?: string
    event?: {}
    parameter?: Parameters[]
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

export type CohortGroup = Group & {
  id: string
  name: string
  quantity: number
  parentId?: string
  subItems?: CohortGroup[]
}

export enum Month {
  JANUARY = 'Janvier',
  FEBRUARY = 'Février',
  MARCH = 'Mars',
  APRIL = 'Avril',
  MAY = 'Mai',
  JUNE = 'Juin',
  JULY = 'Juillet',
  AUGUST = 'Août',
  SEPTEMBER = 'Septembre',
  OCTOBER = 'Octobre',
  NOVEMBER = 'Novembre',
  DECEMBER = 'Décembre'
}

export type Column = {
  label: string | ReactNode
  code?: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  multiple?: Column[]
}

export enum ChartCode {
  AGE_PYRAMID = 'facet-extension.ageMonth',
  GENDER_REPARTITION = 'facet-deceased',
  MONTHLY_VISITS = 'facet-_facet.period.startGender',
  VISIT_TYPE_REPARTITION = 'facet-class.coding.display'
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
  Décembre: MonthVisiteRepartitionType
}

export type CohortData = {
  name?: string
  description?: string
  cohort?: ScopeElement | ScopeElement[]
  totalPatients?: number
  originalPatients?: CohortPatient[]
  totalDocs?: number
  documentsList?: CohortComposition[]
  wordcloudData?: never[]
  encounters?: Encounter[]
  genderRepartitionMap?: GenderRepartitionType
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: VisiteRepartitionType
  agePyramidData?: AgeRepartitionType
  requestId?: string
  favorite?: boolean
  uuid?: string
}

export type CohortResults<T> = {
  total: number
  totalAllResults: number
  totalPatients: number
  totalAllPatients: number
  list: T[]
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

export enum CriteriaGroupType {
  AND_GROUP = 'andGroup',
  AT_LEAST = 'atLeast',
  AT_MOST = 'atMost',
  EXACTLY = 'exactly',
  N_AMONG_M = 'nAmongM',
  OR_GROUP = 'orGroup'
}

export type CriteriaGroup = {
  id: number
  title: string
  criteriaIds: number[]
  isSubGroup?: boolean
  isInclusive?: boolean
} & (
  | {
      type: CriteriaGroupType.AND_GROUP | CriteriaGroupType.OR_GROUP
    }
  | {
      type: CriteriaGroupType.N_AMONG_M
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
  isOpen?: boolean
  parentId?: number | null
  selectedCriteria: SelectedCriteriaType | null
  onChangeSelectedCriteria: (newCriteria: SelectedCriteriaType) => void
  goBack: () => void
}

export type CriteriaItemType = {
  id: CriteriaType
  types?: CriteriaType[]
  title: string
  color: string
  fontWeight?: string
  disabled?: boolean
  subItems?: CriteriaItemType[]
  // here we can't know which type of form data we will have, it could really be anything
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formDefinition?: CriteriaForm<any>
  // component will always be prefered to formDefinition for rendering the form
  component?: React.FC<CriteriaDrawerComponentProps>
}

export type ResearchType = string | boolean | AbortSignal | undefined

export type ValueSet = {
  code: string
  display: string
}

export type ProjectType = {
  uuid: string
  name: string
  description?: string
  created_at?: string
  requests_count?: number
}

export type ParentInfo = {
  uuid: string
  name: string
}

export type RequestType = {
  uuid: string
  query_snapshots?: QuerySnapshotInfo[]
  shared_by?: string
  parent_folder?: ParentInfo
  updated_at?: string
  name: string
  description?: string
  favorite?: boolean
  currentSnapshot?: Snapshot
  requestId?: string
  requestName?: string
  shared_query_snapshot?: string
  usersToShare?: User[]
}

export type QuerySnapshotInfo = {
  uuid: string
  created_at: string
  title: string
  cohorts_count: number
  version: number
}

export type Snapshot = QuerySnapshotInfo & {
  owner?: string
  request?: string
  previous_snapshot: string | null
  dated_measures: DatedMeasure[]
  cohort_results: Cohort[]
  shared_by?: User
  deleted?: boolean
  deleted_by_cascade?: boolean
  modified_at?: string
  serialized_query: string
  is_active_branch?: boolean
  perimeters_ids?: string[]
}

export type RequestQuerySnapshot = Snapshot & {
  name: string
  insert_datetime: string
  update_datetime: string
  delete_datetime: string
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
  extra?: Record<string, string>
}

export type Cohort = {
  uuid?: string
  owner?: string
  result_size?: number
  measure_min?: number
  measure_max?: number
  request?: ParentInfo
  request_query_snapshot?: string
  group_id?: string
  exportable?: boolean
  request_job_status?: JobStatus
  request_job_fail_msg?: string
  created_at?: string
  modified_at?: string
  name?: string
  description?: string
  favorite?: boolean
  extension?: Extension[]
  rights?: GroupRights
  parent_cohort?: ParentInfo
  sampling_ratio?: number | null
  sample_cohorts?: string[]
}

export type CohortRights = {
  cohort_id: string
  rights?: GroupRights
}

export type CohortCount = {
  uuid?: string
  status?: string
  shortCohortLimit?: number
  includePatient?: number
  byrequest?: number
  unknownPatient?: number
  jobFailMsg?: string
  date?: string
  cohort_limit?: number
  count_outdated?: boolean
  extra?: Record<string, string>
}

export type FetchRequest = {
  requestName: string
  snapshotsHistory: QuerySnapshotInfo[]
  json: string
  currentSnapshot: Snapshot
  count: DatedMeasure
  shortCohortLimit: number
  count_outdated: boolean
}

export type Export = {
  motivation: string
  output_format: string
  cohort_id: string
  provider_source_value: string
  target_unix_account: number
  tables: { omop_table_name: string }
  nominative: boolean
  shift_dates: boolean
  cohort_fk: string
  provider_id: string
  owner: string
}

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
  IPP?: string
  idPatient?: string
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

export type CohortQuestionnaireResponse = QuestionnaireResponse & {
  serviceProvider?: string
  NDA?: string
  IPP?: string
  hospitDates?: Period
  idPatient?: string
}

export type CohortObservation = Observation & {
  serviceProvider?: string
  NDA?: string
  IPP?: string
  idPatient?: string
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

export type CohortPMSI = (Condition | Procedure | Claim) & {
  serviceProvider?: string
  idPatient?: string
  NDA?: string
  IPP?: string
}

export type CohortImaging = ImagingStudy & {
  idPatient?: string
  serviceProvider?: string
  NDA?: string
  IPP?: string
  diagnosticReport?: DiagnosticReport
}
export type IPatientImaging<T extends CohortImaging> = {
  loading: boolean
  count: number
  total: number
  list: T[]
  page: number
}

export type TabType<T = string, TL = string> = {
  label: TL
  id: T
  active?: boolean
  icon?: ReactElement
  wrapped?: boolean
}

export type ExplorationTabs = TabType<string, ReactNode>

export type PmsiTab = TabType<PMSIResourceTypes, PMSILabel>

export type MedicationTab = TabType<
  ResourceType.MEDICATION_ADMINISTRATION | ResourceType.MEDICATION_REQUEST,
  MedicationLabel
>

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
export type ScopeElement = {
  id: string
  name: string
  source_value: string
  type: string
  parent_id: string
  above_levels_ids: string
  inferior_levels_ids: string
  cohort_id: string
  cohort_size: string
  full_path: string
  rights?: ReadRightPerimeter
  access?: 'Nominatif' | 'Pseudonymisé'
}
export type ReadRightPerimeter = {
  perimeter: ScopeElement
  read_role: string
  right_read_patient_nominative: boolean
  right_read_patient_pseudonymized: boolean
  right_search_patients_by_ipp: boolean
  read_access?: string
  read_export?: string
  export_access?: string
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

export type AccessExpirationsProps = {
  expiring?: boolean
}

export type AccessExpiration = {
  leftDays: number
  start_datetime: Date
  end_datetime: Date
  profile: string
  perimeter: string
}

// this is an incomplete type, it should be completed with the other fields
export type UserAccesses = {
  role: {
    right_full_admin: boolean
  }
}

export type CustomError = {
  errorType: string
}

export type ExportCSVForm = {
  motif: string
  conditions: boolean
  tables: ExportCSVTable[]
}

export type ExportCSVTable = ExportTableType & {
  checked: boolean
  fhir_filter: SavedFilter | null
  respect_table_relationships: boolean
  count: number
}

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

export enum WebSocketMessageType {
  ANY = 'any',
  JOB_STATUS = 'job_status',
  MAINTENANCE = 'maintenance'
}

export enum WebSocketJobName {
  COUNT = 'count',
  CREATE = 'create'
}

export type WebSocketMessage<T = {}> = {
  type: WebSocketMessageType
} & T

export type WSJobStatus = WebSocketMessage<{
  status: JobStatus
  uuid?: string
  details?: string
  job_name?: WebSocketJobName
  extra_info?: {
    group_id?: string
    request_job_fail_msg?: string
    request_job_status: JobStatus
    measure?: number
    result_size?: number
    extra?: Record<string, string>
    global?: { measure_min: number; measure_max: number }
  }
}> & { type: WebSocketMessageType.JOB_STATUS }

export enum SelectedStatus {
  NOT_SELECTED,
  SELECTED,
  INDETERMINATE
}
