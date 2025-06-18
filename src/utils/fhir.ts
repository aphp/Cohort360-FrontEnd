/**
 * @fileoverview Utility functions for working with FHIR resources
 * @module utils/fhir
 */

import { getConfig } from 'config'
import { Element as FhirElement, Extension, CodeableConcept, Coding, Condition } from 'fhir/r4'

/**
 * Retrieves an extension from a FHIR element by URL
 *
 * @param resource - The FHIR element to search in
 * @param url - The primary URL to search for
 * @param alternativeUrls - Alternative URLs to search for
 * @returns The found extension or undefined
 *
 * @example
 * ```typescript
 * const extension = getExtension(patient, 'http://example.com/extension')
 * ```
 */
export const getExtension = (
  resource: FhirElement | undefined,
  url?: string,
  ...alternativeUrls: string[]
): Extension | undefined => {
  if (resource?.extension && url) {
    return resource.extension.find((item) => item.url === url || alternativeUrls.includes(item.url || ''))
  }
  return undefined
}

/**
 * Gets the preferred coding from a CodeableConcept based on user selection or configuration
 *
 * @param code - The CodeableConcept to extract coding from
 * @returns The preferred Coding or undefined
 *
 * @example
 * ```typescript
 * const coding = getPreferedCode(codeableConcept)
 * ```
 */
export const getPreferedCode = (code?: CodeableConcept): Coding | undefined => {
  return (
    code?.coding?.find((c) => c.userSelected === true) ||
    (!getConfig().core.fhir.selectedCodeOnly ? code?.coding?.[0] : undefined)
  )
}

/**
 * Retrieves an integer value from a FHIR extension
 *
 * @param resource - The FHIR element to search in
 * @param url - The primary URL to search for
 * @param alternativeUrls - Alternative URLs to search for
 * @returns The integer value from the extension or undefined
 *
 * @example
 * ```typescript
 * const ageValue = getExtensionIntegerValue(patient, 'http://example.com/age')
 * ```
 */
export const getExtensionIntegerValue = (
  resource: FhirElement | undefined,
  url?: string,
  ...alternativeUrls: string[]
): number | undefined => {
  const extension = getExtension(resource, url, ...alternativeUrls)
  return extension?.valueInteger
}

/**
 * Gets a category from a Condition resource based on system URL
 *
 * @param resource - The Condition resource to search in
 * @param url - The system URL to match against
 * @returns The matching CodeableConcept or undefined
 *
 * @example
 * ```typescript
 * const category = getCategory(condition, 'http://terminology.hl7.org/CodeSystem/condition-category')
 * ```
 */
export const getCategory = (resource: Condition | undefined, url?: string): CodeableConcept | undefined => {
  if (resource?.category && url) {
    return resource.category.find((e) => e?.coding?.find((a) => a.system === url))
  }
  return undefined
}
