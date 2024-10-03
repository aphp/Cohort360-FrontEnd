import { HierarchyWithLabel } from './hierarchy'
import { OrderBy } from './searchCriterias'

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
  LOINC = 'Loinc',
  ANABIO = 'Anabio',
  GHM = 'Ghm',
  CIM10 = 'Cim10',
  CCAM = 'Ccam'
}

export type Reference = {
  id: References
  label: string
  title: string
  standard: boolean
  url: string
  checked: boolean
  isHierarchy: boolean
  totalCount?: number
  filterRoots: (code: HierarchyWithLabel) => boolean
}

export enum SearchMode {
  EXPLORATION,
  RESEARCH
}

export enum SearchModeLabel {
  EXPLORATION = 'Exploration',
  RESEARCH = 'Recherche'
}
