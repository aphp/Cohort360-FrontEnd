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
  IDocumentReference
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
  lastEncounterName?: string
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

export type Cohort = {
  uuid?: string
  fhir_group_id?: string
  name?: string
  result_size?: number
  created_at?: string
  modified_at?: string
  favorite?: boolean
  type?: string
  request_id?: string
}

export type FormattedCohort = {
  researchId: string
  fhir_group_id?: string
  name?: string
  status?: string
  nPatients?: number
  date?: string
  perimeter?: string
  favorite?: boolean
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
  resourceType?: string
  id: string
  name: string
  quantity: number
  parentId?: string
  subItems?: ScopeTreeRow[] | undefined
  managingEntity?: any | undefined
}

export type SimpleChartDataType = {
  label: string
  value: number
  color: string
  size?: number
}
export type ComplexChartDataType<T, V = { [key: string]: number }> = Map<T, V>

export type CohortData = {
  name?: string
  cohort?: IGroup | IGroup[]
  totalPatients?: number
  originalPatients?: CohortPatient[]
  totalDocs?: number
  documentsList?: (CohortComposition | IDocumentReference)[]
  wordcloudData?: any
  encounters?: IEncounter[]
  genderRepartitionMap?: ComplexChartDataType<PatientGenderKind>
  visitTypeRepartitionData?: SimpleChartDataType[]
  monthlyVisitData?: ComplexChartDataType<Month>
  agePyramidData?: ComplexChartDataType<number, { male: number; female: number; other?: number }>
  requestId?: string
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
      }
    }
)

export type TemporalConstraintType = {
  id?: number
  title?: string
  criteriaGroupIds?: number[]
} & {
  type:
    | 'sameEncounter'
    | 'differentEncounter'
    | 'directChronologicalOrdering'
    | 'directChronologicalOrderingWithDuration'
    | unknown
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
  id?: number
  isInclusive?: boolean
} & (CcamDataType | Cim10DataType | DemographicDataType | GhmDataType | EncounterDataType | DocumentDataType)

export type CcamDataType = {
  title: string
  type: 'Procedure'
  hierarchy: undefined
  code: { id: string; label: string }[] | null
  encounter: number
  comparator: { id: 'le' | 'e' | 'ge'; label: string }
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

export type Cim10DataType = {
  title: string
  type: 'Condition'
  code: { id: string; label: string }[] | null
  diagnosticType: { id: string; label: string }[] | null
  encounter: number
  comparator: { id: 'le' | 'e' | 'ge'; label: string }
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

export type DemographicDataType = {
  title: string
  type: 'Patient'
  gender: { id: string; label: string }[] | null
  vitalStatus: { id: string; label: string }[] | null
  ageType: { id: string; label: string } | null
  label: undefined
  years: [number, number]
}

export type DocumentDataType = {
  title: string
  type: 'Composition'
  search: string
  docType: { id: string; label: string }[] | null
  encounter: number
  comparator: { id: 'le' | 'e' | 'ge'; label: string }
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

export type GhmDataType = {
  title: string
  type: 'Claim'
  code: { id: string; label: string }[] | null
  encounter: number
  comparator: { id: 'le' | 'e' | 'ge'; label: string }
  label: undefined
  startOccurrence: Date
  endOccurrence: Date
}

export type EncounterDataType = {
  label: undefined
  label2: undefined
  type: 'Encounter'
  title: string
  ageType: { id: string; label: string } | null
  years: [number, number]
  durationType: { id: string; label: string }
  duration: [number, number]
  admissionMode: { id: string; label: string } | null
  entryMode: { id: string; label: string } | null
  exitMode: { id: string; label: string } | null
  fileStatus: { id: string; label: string } | null
}

export type CohortCreationCounterType = {
  uuid?: string
  includePatient?: number
  byrequest?: number
  alive?: number
  deceased?: number
  female?: number
  male?: number
}

export type CohortCreationSnapshotType = {
  uuid: string
  json: string
  date: string
}
