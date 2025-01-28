import { getConfig } from 'config'
import { getReferences } from 'data/valueSets'
import { HIERARCHY_ROOT, getChildrenFromCodes } from 'services/aphp/serviceValueSets'
import { Codes, Hierarchy } from 'types/hierarchy'
import { LabelObject } from 'types/searchCriterias'
import { FhirItem } from 'types/valueSet'

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

export const checkIsLeaf = async <T>(codes: Hierarchy<T>[], cache: Codes<Hierarchy<T>>): Promise<boolean> => {
  const children = (codes?.[0]?.inferior_levels_ids || '').split(',')
  if (codes.length !== 1 || codes?.[0]?.id === HIERARCHY_ROOT || children.length > 1) return false
  if (!children[0]) return true
  const code = codes[0]
  const found = cache.get(code.system)?.get(children[0])
  let childCode: Hierarchy<FhirItem>[] = found ? [found] : []
  if (!childCode.length) childCode = (await getChildrenFromCodes(code.system, children)).results
  return checkIsLeaf(childCode, cache)
}
