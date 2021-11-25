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
  PatientGenderKind,
  IObservation,
  IDocumentReference,
  IMedicationRequest,
  IMedicationAdministration
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

export type Cohort_Creation_API_Response = {
  status: number
  data: {
    jobId: string
    result: { _type: 'count'; 'group.id': string; 'group.count': number; source: 'from-cache' | 'from-cache' }[]
  }
  count?: number
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
  description: string
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
}

export type FormattedCohort = {
  researchId: string
  fhir_group_id?: string
  name?: string
  description: string
  status?: string
  nPatients?: number
  nGlobal?: string
  date?: string
  perimeter?: string
  favorite?: boolean
  jobStatus?: string
  jobFailMsg?: string
  canMakeExport?: boolean
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

export enum InclusionCriteriaTypes {
  medicalDocument = 'Document médical',
  patientDemography = 'Démographie patient',
  CIMDiagnostic = 'Diagnostic CIM'
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

export type InclusionCriteria =
  | MedicalDocumentInclusionCriteria
  | PatientDemographyInclusionCriteria
  | CIMDiagnosticInclusionCriteria

export type MedicalDocumentInclusionCriteria = {
  type: InclusionCriteriaTypes.medicalDocument
  name: string
  searchValue: string
  searchFieldCode: string
}

export type PatientDemographyInclusionCriteria = {
  type: InclusionCriteriaTypes.patientDemography
  name: string
  gender: PatientGenderKind
  ageMin: number
  ageMax: number
}

export type CIMDiagnosticInclusionCriteria = {
  type: InclusionCriteriaTypes.CIMDiagnostic
  name: string
  CIMTypeId: string
  CIMDiagnosis: {
    'DIAGNOSIS CODE': string
    'LONG DESCRIPTION': string
    'SHORT DESCRIPTION': string
    FIELD4: string
    FIELD5: string
  }
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
export type ComplexChartDataType<T, V = { [key: string]: number }> = Map<T, V>

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
  startOccurrence: Date
  endOccurrence: Date
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
  startOccurrence: Date
  endOccurrence: Date
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
  docType: { id: string; label: string }[] | null
  encounterEndDate: Date | null
  encounterStartDate: Date | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | null
  endOccurrence: Date | null
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
  startOccurrence: Date | null
  endOccurrence: Date | null
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
  encounterStartDate: Date | null
  encounterEndDate: Date | null
  isInclusive?: boolean
}

export type MedicationDataType = {
  title: string
  code: { id: string; label: string }[] | null
  prescriptionType: { id: string; label: string }[] | null
  administration: { id: string; label: string }[] | null
  occurrence: number
  occurrenceComparator: '<=' | '<' | '=' | '>' | '>='
  startOccurrence: Date | null
  endOccurrence: Date | null
  isInclusive?: boolean
} & (
  | {
      type: 'MedicationRequest'
      prescriptionType: { id: string; label: string }[] | null
    }
  | { type: 'MedicationAdministration' }
)

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
}

export type CohortType = {
  uuid: string
  name: string
  create_task_id?: string
  dated_measure_id?: string
  description?: string
  favorite?: boolean
  fhir_group_id?: string
  owner_id?: string
  request?: string
  request_job_duration?: string
  request_job_fail_msg?: string
  request_job_status?: string
  request_query_snapshot?: string
  result_size?: number
  created_at?: string
  modified_at?: string
  extension?: any[]
}

export type ContactSubmitForm = FormData
