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
    codeSystemUrls: config.features.medication.valueSets.medicationAtc.codeSystemUrls,
    resourceType: config.features.medication.valueSets.medicationAtc.resourceType,
    loadingMode: config.features.medication.valueSets.medicationAtc.loadingMode,
    checked: true,
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
    codeSystemUrls: config.features.medication.valueSets.medicationUcd.codeSystemUrls,
    resourceType: config.features.medication.valueSets.medicationUcd.resourceType,
    loadingMode: config.features.medication.valueSets.medicationUcd.loadingMode,
    checked: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: true,
    filterRoots: () => true
  },
  {
    id: References.ANABIO,
    title: 'Toute la hiérarchie',
    label: ReferencesLabel.ANABIO,
    standard: true,
    url: config.features.observation.valueSets.biologyHierarchyAnabio.url,
    codeSystemUrls: config.features.observation.valueSets.biologyHierarchyAnabio.codeSystemUrls,
    resourceType: config.features.observation.valueSets.biologyHierarchyAnabio.resourceType,
    loadingMode: config.features.observation.valueSets.biologyHierarchyAnabio.loadingMode,
    checked: true,
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
    codeSystemUrls: config.features.observation.valueSets.biologyHierarchyLoinc.codeSystemUrls,
    resourceType: config.features.observation.valueSets.biologyHierarchyLoinc.resourceType,
    loadingMode: config.features.observation.valueSets.biologyHierarchyLoinc.loadingMode,
    checked: true,
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
    codeSystemUrls: config.features.procedure.valueSets.procedureHierarchy.codeSystemUrls,
    resourceType: config.features.procedure.valueSets.procedureHierarchy.resourceType,
    loadingMode: config.features.procedure.valueSets.procedureHierarchy.loadingMode,
    checked: true,
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
    codeSystemUrls: config.features.condition.valueSets.conditionHierarchy.codeSystemUrls,
    resourceType: config.features.condition.valueSets.conditionHierarchy.resourceType,
    loadingMode: config.features.condition.valueSets.conditionHierarchy.loadingMode,
    checked: true,
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
    codeSystemUrls: config.features.claim.valueSets.claimHierarchy.codeSystemUrls,
    resourceType: config.features.claim.valueSets.claimHierarchy.resourceType,
    loadingMode: config.features.claim.valueSets.claimHierarchy.loadingMode,
    checked: true,
    joinDisplayWithCode: true,
    joinDisplayWithSystem: false,
    filterRoots: () => true
  }
]
