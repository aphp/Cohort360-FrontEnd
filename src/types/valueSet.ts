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
  joinDisplayWithCode: boolean
  joinDisplayWithSystem: boolean
  filterRoots?: <T>(code: Hierarchy<T>) => boolean
}

export type FhirItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string
}
