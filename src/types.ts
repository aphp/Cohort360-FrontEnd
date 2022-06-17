import { ReactNode, ReactElement } from 'react'
import {
  IComposition,
  IPatient,
  IClaim,
  IProcedure,
  IEncounter,
  ICondition,
  IGroup,
  IBundle,
  IBundle_Entry,
  IResourceList,
  IOperationOutcome,
  IObservation,
  IDocumentReference,
  IMedicationRequest,
  IMedicationAdministration,
  PatientGenderKind
} from '@ahryman40k/ts-fhir-types/lib/R4'

export interface TypedEntry<T extends IResourceList> extends IBundle_Entry {
  resource?: T
}

export interface TypedBundle<T extends IResourceList> extends IBundle {
  entry?: TypedEntry<T>[]
}

export type FHIR_API_Response<T extends IResourceList> = TypedBundle<T> | IOperationOutcome

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

export type CohortComposition = IComposition & {
  deidentified?: boolean
  idPatient?: string
  IPP?: string
  encounterStatus?: string
  serviceProvider?: string
  NDA?: string
}

export type CohortEncounter = IEncounter & {
  documents?: CohortComposition[]
  details?: IEncounter[]
}

export type CohortPatient = IPatient & {
  lastEncounter?: IEncounter
  lastProcedure?: IProcedure
  mainDiagnosis?: ICondition[]
  labResults?: IObservation[]
  inclusion?: boolean
  lastGhm?: IClaim
  associatedDiagnosis?: ICondition[]
  lastLabResults?: IObservation
}

export type PMSIEntry<T extends IProcedure | ICondition | IClaim> = T & {
  documents?: (CohortComposition | IDocumentReference)[]
  serviceProvider?: string
  NDA?: string
}

export type MedicationEntry<T extends IMedicationRequest | IMedicationAdministration> = T & {
  documents?: (CohortComposition | IDocumentReference)[]
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
}

export type CohortFilters = {
  status: ValueSet[]
  type: string
  favorite: string
  minPatients: null | string
  maxPatients: null | string
  startDate: null | string
  endDate: null | string
}

export type DocumentFilters = {
  ipp?: string
  nda: string
  selectedDocTypes: { code: string; label: string; type: string }[]
  startDate: string | null
  endDate: string | null
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
  gender: PatientGenderKind
  birthdates: [string, string]
  vitalStatus: VitalStatus
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

export type CohortGroup = IGroup & {
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
  identifier = 'identifier'
}

export enum VitalStatus {
  alive = 'alive',
  deceased = 'deceased',
  all = 'all'
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

export type ScopeTreeRow = {
  access?: string
  resourceType?: string
  id: string
  name: string
  quantity: number
  parentId?: string
  subItems: ScopeTreeRow[]
  managingEntity?: any | undefined
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
  cohort?: IGroup | IGroup[]
  totalPatients?: number
  originalPatients?: CohortPatient[]
  totalDocs?: number
  documentsList?: (CohortComposition | IDocumentReference)[]
  wordcloudData?: any
  encounters?: IEncounter[]
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
  hospit?: (CohortEncounter | IEncounter)[]
  documents?: (CohortComposition | IDocumentReference)[]
  documentsTotal?: number
  consult?: PMSIEntry<IProcedure>[]
  consultTotal?: number
  diagnostic?: PMSIEntry<ICondition>[]
  diagnosticTotal?: number
  ghm?: PMSIEntry<IClaim>[]
  ghmTotal?: number
  medicationRequest?: IMedicationRequest[]
  medicationRequestTotal?: number
  medicationAdministration?: IMedicationAdministration[]
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
  idList: ['All'] | number[]
  constraintType: 'none' | 'sameEncounter' | 'differentEncounter' | 'directChronologicalOrdering'
}

export type CriteriaItemType = {
  id: string
  title: string
  color: string
  components: any
  disabled?: boolean
  data?: any
  fetch?: any
  valueSet?: any
  subItems?: CriteriaItemType[]
}

export type SelectedCriteriaType = {
  id: number
  error?: boolean
} & (
  | CcamDataType
  | Cim10DataType
  | DemographicDataType
  | GhmDataType
  | EncounterDataType
  | DocumentDataType
  | MedicationDataType
  | ObservationDataType
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
  ageType: { id: string; label: string } | null
  years: [number, number]
  isInclusive?: boolean
}

export type DocumentDataType = {
  title: string
  type: 'Composition'
  search: string
  regex_search: string
  docType: { id: string; label: string }[] | null
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

export type EncounterDataType = {
  type: 'Encounter'
  title: string
  ageType: { id: string; label: string } | null
  years: [number, number]
  durationType: { id: string; label: string }
  duration: [number, number]
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
  query_snapshots?: string[]
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

export type IPatientDetails = IPatient & {
  lastEncounter?: IEncounter
  lastGhm?: IClaim | 'loading'
  lastProcedure?: IProcedure | 'loading'
  mainDiagnosis?: ICondition[] | 'loading'
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
}

export type IPatientPmsi<T extends IProcedure | ICondition | IClaim> = {
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

export type CohortMedication<T extends IMedicationRequest | IMedicationAdministration> = T & {
  serviceProvider?: string
  NDA?: string
}

export type IPatientMedication<T extends IMedicationRequest | IMedicationAdministration> = {
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
      selectedPrescriptionTypes?: { id: string; label: string }[]
      selectedAdministrationRoutes?: { id: string; label: string }[]
    }
    sort?: {
      by: string
      direction: string
    }
  }
}

export type CohortObservation = IObservation & {
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
  onSearch: (newSearch: string, newSearchBy?: SearchByTypes) => void
  searchBy?: any
}
export type DTTB_ButtonType = {
  label: string
  icon?: ReactElement
  onClick: (args?: any) => void
}
