import { getConfig } from 'config'
import { getReferences } from 'data/valueSets'
import { HIERARCHY_ROOT } from 'services/aphp/serviceValueSets'
import { Hierarchy } from 'types/hierarchy'
import { LabelObject } from 'types/searchCriterias'

export const getValueSetsFromSystems = (systems: string[]) => {
  return getReferences(getConfig()).filter((reference) => systems.includes(reference.url))
}

export const isDisplayedWithCode = (system: string) => {
  const isFound = getValueSetsFromSystems([system])?.[0]
  return isFound?.joinDisplayWithCode
}

export const isDisplayedWithSystem = (system: string) => {
  const isFound = getValueSetsFromSystems([system])?.[0]
  return isFound?.joinDisplayWithSystem
}

export const getLabelFromCode = <T>(code: Hierarchy<T>) => {
  if (isDisplayedWithCode(code.system) && code.id !== HIERARCHY_ROOT) return `${code.id} - ${code.label}`
  return code.label
}

export const getFullLabelFromCode = (code: LabelObject) => {
  let label = ''
  if (code.system) {
    if (isDisplayedWithSystem(code.system)) label += `${getLabelFromSystem(code.system)} - `
    if (isDisplayedWithCode(code.system) && code.id !== HIERARCHY_ROOT) label += `${code.id} - `
  }
  label += code.label
  return label
}

export const getLabelFromSystem = (system: string) => {
  const isFound = getValueSetsFromSystems([system])?.[0]
  return isFound?.label || ''
}
