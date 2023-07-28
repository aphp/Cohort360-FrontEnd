import { ReactElement, ReactNode } from 'react'
import {
  Bundle,
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  FhirResource,
  Group,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  OperationOutcome,
  Patient,
  Procedure
} from 'fhir/r4'

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

export enum GenderStatus {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
  OTHER_UNKNOWN = 'other,unknown'
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

export type FHIR_API_Response<T extends FhirResource> = Bundle<T> | OperationOutcome

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

export type Cohort = {
  uuid?: string
  fhir_group_id?: string
  name?: string
  description?: string
  result_size?: number
  dated_measure?: any
  dated_measure_global?: any
  created_at?: string
  modified_at?: string
  favorite?: boolean
  type?: string
  request?: string
  request_job_status?: string
  request_job_fail_msg?: string
  create_task_id?: string
  dated_measure_id?: string
  owner_id?: string
  request_job_duration?: string
  request_query_snapshot?: string
  extension?: any[]
  exportable?: boolean
  rights?: GroupRights
}

export type CohortFilters = {
  status: ValueSet[]
  favorite: string
  minPatients: null | string
  maxPatients: null | string
  startDate: null | string
  endDate: null | string
}

export type SimpleCodeType = { code: string; label: string; type: string }

export type DocumentFilters = {
  ipp?: string
  nda: string
  selectedDocTypes: SimpleCodeType[]
  startDate: string | null
  endDate: string | null
  onlyPdfAvailable: boolean
}

export type MedicationsFilters = {
  nda: string
  startDate: string | null
  endDate: string | null
  selectedPrescriptionTypes: { id: string; label: string }[]
  selectedAdministrationRoutes: { id: string; label: string }[]
}

export type PMSIFilters = {
  nda: string
  code: string
  startDate: string | null
  endDate: string | null
  selectedDiagnosticTypes: { id: string; label: string }[]
}

export type PatientFilters = {
  gender: GenderStatus[]
  birthdatesRanges: [string, string]
  vitalStatus: VitalStatus[]
}

export type ObservationFilters = {
  nda: string
  loinc: string
  anabio: string
  startDate: string | null
  endDate: string | null
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

export enum SearchByTypes {
  text = '_text',
  family = 'family',
  given = 'given',
  identifier = 'identifier',
  description = 'description'
}

export type AbstractTree<T> = T & {
  id: string
  subItems: AbstractTree<T>[]
}

export enum VitalStatus {
  ALIVE = 'alive',
  DECEASED = 'deceased',
  ALL = 'all'
}

export type Column =
  | {
      label: string | ReactNode
      code?: string
      align: 'inherit' | 'left' | 'center' | 'right' | 'justify'
      sortableColumn?: boolean
      multiple?: undefined
    }
  | {
      multiple: Column[]
    }

export type Order = {
  orderBy: string
  orderDirection: 'asc' | 'desc'
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
  agePyramid = 'facet-extension.age-month',
  genderRepartition = 'facet-deceased',
  monthlyVisits = 'facet-facet.period.start-gender',
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
  criteriaIds: number[] // = [SelectedCriteriaType.id | CriteriaGroupType.id, ...]
  isSubGroup?: boolean
  isInclusive?: boolean
} & (
  | {
      type: 'andGroup' | 'orGroup'
    }
  | {
      type: 'NamongM'
      options: {
        operator: '=' | '<' | '>' | '<=' | '>='
        number: number
        timeDelayMin: number
        timeDelayMax: number
      }
    }
)

export type TemporalConstraintsType = {
  id?: number
  idList: ['All'] | number[]
  constraintType: 'none' | 'sameEncounter' | 'differentEncounter' | 'directChronologicalOrdering'
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

export type CriteriaItemType = {
  id: string
  title: string
  fontWeight?: string
  color: string
  components: any
  disabled?: boolean
  data?: any
  fetch?: any
  valueSet?: any
  subItems?: CriteriaItemType[]
  icone?: any
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
  type: 'Procedure'
  hierarchy: undefined
  code: { id: string; label: string }[] | null
  encounterEndDate: Date | null
  encounterStartDate: Date | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  label: undefined
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  isInclusive?: boolean
}

export type Cim10DataType = {
  title: string
  type: 'Condition'
  code: { id: string; label: string }[] | null
  diagnosticType: { id: string; label: string }[] | null
  encounterEndDate: Date | null
  encounterStartDate: Date | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  label: undefined
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  isInclusive?: boolean
}

export type DemographicDataType = {
  title: string
  type: 'Patient'
  gender: { id: string; label: string }[] | null
  vitalStatus: { id: string; label: string }[] | null
  ageType: { id: Calendar; criteriaLabel: CalendarLabel; requestLabel: CalendarRequestLabel }
  years: [number, number]
  isInclusive?: boolean
}

export type IPPListDataType = {
  title: string
  type: 'IPPList'
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
  type: 'DocumentReference'
  search: string
  searchBy: SearchByTypes.text | SearchByTypes.description
  docType: DocType[] | null
  encounterEndDate: Date | ''
  encounterStartDate: Date | ''
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  isInclusive?: boolean
}

export type GhmDataType = {
  title: string
  type: 'Claim'
  code: { id: string; label: string }[] | null
  encounterEndDate: Date | null
  encounterStartDate: Date | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  label: undefined
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  isInclusive?: boolean
}

export enum Calendar {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day'
}

export enum CalendarLabel {
  YEAR = 'années',
  MONTH = 'mois',
  DAY = 'jours'
}

export enum CalendarRequestLabel {
  YEAR = 'an(s)',
  MONTH = 'mois',
  DAY = 'jour(s)'
}

export type EncounterDataType = {
  type: 'Encounter'
  title: string
  age: [number | null, number | null]
  ageType: [
    { id: Calendar; criteriaLabel?: CalendarLabel; requestLabel: CalendarRequestLabel },
    { id: Calendar; criteriaLabel?: CalendarLabel; requestLabel: CalendarRequestLabel }
  ]
  duration: [number | null, number | null]
  durationType: [
    { id: Calendar; criteriaLabel?: CalendarLabel; requestLabel: CalendarRequestLabel },
    { id: Calendar; criteriaLabel?: CalendarLabel; requestLabel: CalendarRequestLabel }
  ]
  admissionMode: { id: string; label: string }[] | null
  entryMode: { id: string; label: string }[] | null
  exitMode: { id: string; label: string }[] | null
  priseEnChargeType: { id: string; label: string }[] | null
  typeDeSejour: { id: string; label: string }[] | null
  fileStatus: { id: string; label: string }[] | null
  discharge: { id: string; label: string }[] | null
  reason: { id: string; label: string }[] | null
  destination: { id: string; label: string }[] | null
  provenance: { id: string; label: string }[] | null
  admission: { id: string; label: string }[] | null
  encounterStartDate: Date | ''
  encounterEndDate: Date | ''
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  isInclusive?: boolean
}

export type MedicationDataType = {
  title: string
  code: { id: string; label: string }[] | null
  prescriptionType: { id: string; label: string }[] | null
  administration: { id: string; label: string }[] | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | ''
  endOccurrence: Date | ''
  encounterEndDate: Date | null
  encounterStartDate: Date | null
  isInclusive?: boolean
} & (
  | {
      type: 'MedicationRequest'
      prescriptionType: { id: string; label: string }[] | null
    }
  | { type: 'MedicationAdministration' }
)

export type ObservationDataType = {
  title: string
  type: 'Observation'
  code: { id: string; label: string }[] | null
  isLeaf: boolean
  valueMin: number
  valueMax: number
  valueComparator: '<=' | '<' | '=' | '>' | '>=' | '<x>'
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | null
  endOccurrence: Date | null
  isInclusive?: boolean
  encounterStartDate: Date | null
  encounterEndDate: Date | null
}

export type CohortCreationCounterType = {
  uuid?: string
  status?: string
  includePatient?: number
  byrequest?: number
  alive?: number
  deceased?: number
  female?: number
  male?: number
  unknownPatient?: number
  jobFailMsg?: string
  date?: string
  cohort_limit?: number
  count_outdated?: boolean
}

export type CohortCreationSnapshotType = {
  uuid: string
  json: string
  date: string
  dated_measures?: any[]
}

export type ValueSet = {
  code: string
  display: string
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

export type QuerySnapshotInfo = {
  uuid: string
  title: string
  created_at: string
  has_linked_cohorts: boolean
  version: number
}

export type RequestType = {
  uuid: string
  name: string
  parent_folder?: string
  description?: string
  owner_id?: string
  data_type_of_query?: string
  favorite?: boolean
  created_at?: string
  modified_at?: string
  query_snapshots?: QuerySnapshotInfo[]
  shared_query_snapshot?: string[]
  usersToShare?: Provider[]
  shared_by?: Provider
  currentSnapshot?: string
  requestId?: string
  requestName?: string
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
  searchInputError?: searchInputError
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
  VALIDATED = 'Validé'
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

export type searchInputError = {
  isError: boolean
  errorsDetails?: errorDetails[]
}

export type errorDetails = {
  errorName?: string
  errorPositions?: number[]
  errorSolution?: string
}

// DataTableTopBarProps
export type DTTB_TabsType = {
  value: any
  onChange: (event: any, newValue?: any) => void
  list: {
    label: string
    value: any
    icon?: ReactElement
    wrapped?: boolean
  }[]
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
  error?: searchInputError
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
export type HierarchyElement = {
  id: string
  label: string
  subItems?: any[]
}
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
  right_read_patient_pseudo_anonymised: boolean
  right_search_patient_with_ipp: boolean
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
  perimeter_id: string
  care_site_id: number
  provider_id: string
  care_site_history_ids: number[]
  access_ids: number[]
  right_read_patient_nominative: boolean
  right_read_patient_pseudo_anonymised: boolean
  right_search_patient_with_ipp: boolean
  right_export_csv_nominative: boolean
  right_export_csv_pseudo_anonymised: boolean
  right_transfer_jupyter_nominative: boolean
  right_transfer_jupyter_pseudo_anonymised: boolean
  export_csv_nomi?: boolean
  export_csv_pseudo?: boolean
  export_jupyter_nomi?: boolean
  export_jupyter_pseudo?: boolean
  read_patient_nomi?: boolean
  read_patient_pseudo?: boolean
}

export type ErrorType = { isError: boolean; errorMessage?: string }
export type AgeRangeType = {
  year?: number
  month?: number
  days?: number
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
  VisitSupport = 'supported'
}
export type CriteriaNameType =
  | CriteriaName.Cim10
  | CriteriaName.Ccam
  | CriteriaName.Ghm
  | CriteriaName.Document
  | CriteriaName.Medication
  | CriteriaName.Biology
  | CriteriaName.VisitSupport

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

export enum IdType {
  Request = 'Request',
  IPPList = 'IPPList',
  Patient = 'Patient',
  Encounter = 'Encounter',
  DocumentReference = 'DocumentReference',
  Pmsi = 'pmsi',
  Condition = 'Condition',
  Procedure = 'Procedure',
  Claim = 'Claim',
  Medication = 'Medication',
  Biologie_microbiologie = 'biologie_microbiologie',
  Observation = 'Observation',
  Microbiologie = 'microbiologie',
  Physiologie = 'physiologie'
}
