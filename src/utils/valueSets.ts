/**
 * @fileoverview Utility functions for working with value sets and code systems
 * @module utils/valueSets
 */

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

/**
 * Checks if a system should display system name alongside labels
 *
 * @param system - The system URL to check
 * @returns True if system name should be displayed with labels, false otherwise
 *
 * @example
 * ```typescript
 * isDisplayedWithSystem('http://loinc.org') // returns true/false based on configuration
 * ```
 */
export const isDisplayedWithSystem = (system: string) => {
  const isFound = getValueSetReferenceFromCodeSystem(system)
  return isFound?.joinDisplayWithSystem
}

/**
 * Gets the display label for a code, optionally including the code ID
 *
 * @template T - The type of the hierarchy data
 * @param code - The hierarchical code object
 * @returns The formatted label string
 *
 * @example
 * ```typescript
 * getLabelFromCode(codeHierarchy) // returns 'Code123 - Label' or just 'Label'
 * ```
 */
export const getLabelFromCode = <T>(code: Hierarchy<T>) => {
  if (isDisplayedWithCode(code.system) && code.id !== HIERARCHY_ROOT) return `${code.id} - ${code.label}`
  return code.label
}

/**
 * Gets the full display label for a code, including system name and code ID if configured
 *
 * @param code - The label object containing system, id, and label
 * @returns The fully formatted label string
 *
 * @example
 * ```typescript
 * getFullLabelFromCode({ system: 'http://loinc.org', id: '123', label: 'Test' })
 * // returns 'LOINC - 123 - Test' or variations based on configuration
 * ```
 */
export const getFullLabelFromCode = (code: LabelObject) => {
  let label = ''
  if (code.system) {
    if (isDisplayedWithSystem(code.system)) label += `${getLabelFromSystem(code.system)} - `
    if (isDisplayedWithCode(code.system) && code.id !== HIERARCHY_ROOT) label += `${code.id} - `
  }
  label += code.label
  return label
}

/**
 * Gets the display label for a system
 *
 * @param system - The system URL to get the label for
 * @returns The system label or empty string if not found
 *
 * @example
 * ```typescript
 * getLabelFromSystem('http://loinc.org') // returns 'LOINC'
 * ```
 */
export const getLabelFromSystem = (system: string) => {
  const isFound = getValueSetReferenceFromCodeSystem(system)
  return isFound?.label || ''
}

/**
 * Checks if a code is a leaf node (has no children) in the hierarchy
 *
 * @template T - The type of the hierarchy data
 * @param codes - Array of hierarchical codes to check
 * @param cache - Cache of already loaded codes
 * @returns Promise that resolves to true if the code is a leaf, false otherwise
 *
 * @example
 * ```typescript
 * const isLeaf = await checkIsLeaf([codeHierarchy], codeCache)
 * ```
 */
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
