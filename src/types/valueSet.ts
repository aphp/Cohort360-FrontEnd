import { Hierarchy } from './hierarchy'

export enum References {
  ATC,
  UCD,
  UCD_13,
  LOINC,
  ANABIO,
  GHM,
  CIM10,
  CCAM
}

export enum ReferencesLabel {
  ATC = 'ATC',
  UCD = 'UCD',
  UCD_13 = 'UCD 13',
  LOINC = 'LOINC',
  ANABIO = 'ANABIO',
  GHM = 'GHM',
  CIM10 = 'CIM10',
  CCAM = 'CCAM'
}

export type Reference = {
  id: References
  label: string
  title: string
  standard: boolean
  url: string // ValueSet URL (for searching/listing valuesets)
  codeSystemUrls?: string[] // Array of CodeSystem URLs (for individual codes within valuesets)
  checked: boolean
  isHierarchy: boolean
  joinDisplayWithCode: boolean
  joinDisplayWithSystem: boolean
  filterRoots?: <T>(code: Hierarchy<T>) => boolean
}

export type ValueSetSortField = 'statTotalUnique' | 'statTotal'

export type ValueSetSorting = {
  field: ValueSetSortField
  order: 'asc' | 'desc'
}

export type FhirItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string // CodeSystem URL (for individual code identification)
  valueSetUrl?: string // ValueSet URL (for grouping and API calls)
  statTotal?: number
  statTotalUnique?: number
}

// Utility types for reverse lookup functionality
export type CodeSystemToValueSetMap = Record<string, string>
export type ValueSetToCodeSystemMap = Record<string, string>
