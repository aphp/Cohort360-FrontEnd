import { PatientState } from 'state/patient'
import { ResourceType } from './requestCriterias'
import { SearchCriterias } from './searchCriterias'

export type ResourceOptions<T> = {
  deidentified: boolean
  page: number
  searchCriterias: SearchCriterias<T>
  type?: ResourceType
  groupId?: string
  patient?: PatientState
  includeFacets?: boolean
}

export enum URLS {
  PATIENTS = 'patients',
  COHORT = 'cohort',
  PERIMETERS = 'perimeters',
  NEW_COHORT = 'new_cohort'
}
