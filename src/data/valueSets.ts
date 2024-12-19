import { AppConfig } from 'config'
import { LabelObject } from 'types/searchCriterias'
import {  References, ReferencesLabel } from 'types/valueSet'

export const getReferences = (config: Readonly<AppConfig>) => [
  {
    id: References.ATC,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.ATC,
    standard: true,
    url: config.features.medication.valueSets.medicationAtc.url,
    checked: true,
    isHierarchy: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: true,
    filterRoots: <T>(code: LabelObject) => /^[A-WZ]$/.test(code.id)
  },
  {
    id: References.UCD,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.UCD,
    standard: true,
    url: config.features.medication.valueSets.medicationUcd.url,
    checked: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: true,
    isHierarchy: false,
    filterRoots: () => true
  },
  {
    id: References.ANABIO,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.ANABIO,
    standard: true,
    url: config.features.observation.valueSets.biologyHierarchyAnabio.url,
    checked: true,
    isHierarchy: true,
    joinDisplayWithCode: false,
    joinDisplayWithSystem: true,
    filterRoots: <T>(biologyItem: LabelObject) =>
      biologyItem.id !== '527941' &&
      biologyItem.id !== '547289' &&
      biologyItem.id !== '528247' &&
      biologyItem.id !== '981945' &&
      biologyItem.id !== '834019' &&
      biologyItem.id !== '528310' &&
      biologyItem.id !== '528049' &&
      biologyItem.id !== '527570' &&
      biologyItem.id !== '527614'
  },
  {
    id: References.LOINC,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.LOINC,
    standard: true,
    url: config.features.observation.valueSets.biologyHierarchyLoinc.url,
    checked: true,
    isHierarchy: false,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: true,
    filterRoots: () => true
  },
  {
    id: References.CCAM,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.CCAM,
    standard: true,
    url: config.features.procedure.valueSets.procedureHierarchy.url,
    checked: true,
    isHierarchy: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: false,
    filterRoots: () => true
  },
  {
    id: References.CIM10,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.CIM10,
    standard: true,
    url: config.features.condition.valueSets.conditionHierarchy.url,
    checked: true,
    isHierarchy: true,
    joinDisplayWithSystem: false,
    joinDisplayWithCode: true,
    filterRoots: () => true
  },
  {
    id: References.GHM,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.GHM,
    standard: true,
    url: config.features.claim.valueSets.claimHierarchy.url,
    checked: true,
    isHierarchy: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: false,
    filterRoots: () => true
  }
]
