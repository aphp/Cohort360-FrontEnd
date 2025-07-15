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

/**
 * Gets value set references that match the provided systems
 *
 * @param systems - Array of system URLs to filter by
 * @returns Array of matching value set references
 *
 * @example
 * ```typescript
 * const valueSets = getValueSetsFromSystems(['http://loinc.org', 'http://snomed.info/sct'])
 * ```
 */
export const getValueSetsFromSystems = (systems: string[]) => {
  return getReferences(getConfig()).filter((reference) => systems.includes(reference.url))
}

/**
 * Checks if a system should display codes alongside labels
 *
 * @param system - The system URL to check
 * @returns True if codes should be displayed with labels, false otherwise
 *
 * @example
 * ```typescript
 * isDisplayedWithCode('http://loinc.org') // returns true/false based on configuration
 * ```
 */
export const isDisplayedWithCode = (system: string) => {
  const isFound = getValueSetsFromSystems([system])?.[0]
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
  const isFound = getValueSetsFromSystems([system])?.[0]
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
  const isFound = getValueSetsFromSystems([system])?.[0]
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
  const found = cache.get(code.system)?.get(children[0])
  let childCode: Hierarchy<FhirItem>[] = found ? [found] : []
  if (!childCode.length) childCode = (await getChildrenFromCodes(code.system, children)).results
  return checkIsLeaf(childCode, cache)
}
