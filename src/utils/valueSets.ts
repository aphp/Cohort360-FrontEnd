import { getConfig } from 'config'
import { getReferences } from 'data/valueSets'
import { HIERARCHY_ROOT, getChildrenFromCodes } from 'services/aphp/serviceValueSets'
import { Codes, Hierarchy } from 'types/hierarchy'
import { LabelObject } from 'types/searchCriterias'
import { FhirItem } from 'types/valueSet'

export const getValueSetsByUrls = (urls: string[]) => {
  return getReferences(getConfig()).filter((reference) => urls.includes(reference.url))
}

// Reverse lookup function: given a CodeSystem URL, find the corresponding ValueSet URL
export const getValueSetFromCodeSystem = (codeSystemUrl: string): string | undefined => {
  const references = getReferences(getConfig())
  const reference = references.find((ref) => ref.codeSystemUrls?.includes(codeSystemUrl))
  return reference?.url
}

// Helper function to get ValueSet Reference from CodeSystem URL
export const getValueSetReferenceFromCodeSystem = (codeSystemUrl: string) => {
  const references = getReferences(getConfig())
  return references.find((ref) => ref.codeSystemUrls?.includes(codeSystemUrl))
}

export const isDisplayedWithCode = (system: string) => {
  const isFound = getValueSetReferenceFromCodeSystem(system)
  return isFound?.joinDisplayWithCode
}

export const isDisplayedWithSystem = (system: string) => {
  const isFound = getValueSetReferenceFromCodeSystem(system)
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
  const isFound = getValueSetReferenceFromCodeSystem(system)
  return isFound?.label || ''
}

export const checkIsLeaf = async <T>(codes: Hierarchy<T>[], cache: Codes<Hierarchy<T>>): Promise<boolean> => {
  const children = (codes?.[0]?.inferior_levels_ids || '').split(',')
  if (codes.length !== 1 || codes?.[0]?.id === HIERARCHY_ROOT || children.length > 1) return false
  if (!children[0]) return true
  const code = codes[0]
  const cacheKey = code.valueSetUrl || code.system
  const found = cache.get(cacheKey)?.get(children[0])
  let childCode: Hierarchy<FhirItem>[] = found ? [found] : []
  if (!childCode.length) {
    // If we only have system (CodeSystem URL), try to find the corresponding ValueSet URL
    const actualValueSetUrl = code.valueSetUrl || getValueSetFromCodeSystem(code.system) || code.system

    childCode = (await getChildrenFromCodes(actualValueSetUrl, children)).results
  }
  return checkIsLeaf(childCode, cache)
}
