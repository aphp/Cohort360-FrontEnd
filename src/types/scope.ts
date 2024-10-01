import { ReadRightPerimeter } from 'types'

export type FetchScopeOptions = {
  ids?: string
  cohortIds?: string
  practitionerId?: string
  search?: string
  page?: number
  limit?: number
  sourceType?: SourceType
}

export enum SourceType {
  BIOLOGY,
  CCAM,
  CIM10,
  GHM,
  MEDICATION,
  DOCUMENT,
  SUPPORTED,
  IMAGING,
  FORM_RESPONSE,
  MATERNITY,
  APHP,
  ALL
}

export enum Rights {
  EXPIRED = 'expired'
}

export enum System {
  ScopeTree = 'scope_tree'
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
