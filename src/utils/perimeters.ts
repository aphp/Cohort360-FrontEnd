/**
 * @fileoverview Utility functions for perimeter and scope management
 * @module utils/perimeters
 */

import { SourceType } from 'types/scope'
import { Back_API_Response, CustomError } from 'types'
import { getConfig } from 'config'

/**
 * Gets the scope level corresponding to a source type based on configuration hierarchy
 *
 * @param type - The source type to get the scope level for
 * @returns The scope level string for the given source type
 *
 * @example
 * ```typescript
 * getScopeLevelBySourceType(SourceType.APHP) // returns level0
 * getScopeLevelBySourceType(SourceType.BIOLOGY) // returns level1
 * ```
 */
export const getScopeLevelBySourceType = (type: SourceType) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  // TODO: Refactor this function to use an external mapping file/configuration
  const level0 = sourceTypeLevels[0]
  const level1 =
    sourceTypeLevels.length > 3 ? sourceTypeLevels[3] : sourceTypeLevels.length > 1 ? sourceTypeLevels[1] : level0
  const level2 = sourceTypeLevels.length > 5 ? sourceTypeLevels[5] : sourceTypeLevels[sourceTypeLevels.length - 1]
  switch (type) {
    case SourceType.APHP:
      return level0
    case SourceType.BIOLOGY:
    case SourceType.GHM:
    case SourceType.MEDICATION:
    case SourceType.IMAGING:
    case SourceType.MATERNITY:
    case SourceType.FORM_RESPONSE:
      return level1
    case SourceType.DOCUMENT:
    case SourceType.CCAM:
    case SourceType.CIM10:
    case SourceType.SUPPORTED:
    case SourceType.ALL:
      return level2
    default:
      return level2
  }
}

/**
 * Checks if a source type is within the specified scope level
 *
 * @param sourceType - The source type to check
 * @param type - The scope level type to check against
 * @returns True if the source type is within the scope level, false otherwise
 *
 * @example
 * ```typescript
 * isSourceTypeInScopeLevel(SourceType.BIOLOGY, 'level1') // returns true
 * ```
 */
export const isSourceTypeInScopeLevel = (sourceType: SourceType, type: string) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  const scopeLevel = getScopeLevelBySourceType(sourceType)
  const sourceTypeIndex = sourceTypeLevels.find((level) => level === scopeLevel) ?? -1
  const typeIndex = sourceTypeLevels.find((level) => level === type) ?? -1
  if (typeIndex > sourceTypeIndex) return false
  return true
}

/**
 * Converts scope levels to a request parameter string for a given source type
 *
 * @param sourceType - The source type to generate parameters for
 * @returns A comma-separated string of scope levels
 *
 * @example
 * ```typescript
 * scopeLevelsToRequestParam(SourceType.BIOLOGY) // returns 'level0,level1'
 * ```
 */
export const scopeLevelsToRequestParam = (sourceType: SourceType) => {
  const sourceTypeLevels = getConfig().core.perimeterSourceTypeHierarchy
  const levels: string[] = []
  for (const element of sourceTypeLevels) {
    levels.push(element)
    if (element === getScopeLevelBySourceType(sourceType)) break
  }
  return levels.join(',')
}

/**
 * Type guard to check if a response is a custom error
 *
 * @template T - The type of the expected response data
 * @param response - The response to check
 * @returns True if the response is a CustomError, false otherwise
 *
 * @example
 * ```typescript
 * if (isCustomError(response)) {
 *   // Handle custom error
 * }
 * ```
 */
export const isCustomError = <T>(response: Back_API_Response<T> | CustomError): response is CustomError => {
  return response && !!(response as CustomError).errorType
}

/**
 * Formats a perimeter display string with optional source value prefix
 *
 * @param source_value - The source value to prefix with (can be null)
 * @param name - The name to display
 * @returns A formatted display string
 *
 * @example
 * ```typescript
 * perimeterDisplay('SRC123', 'Hospital A') // returns 'SRC123 - Hospital A'
 * perimeterDisplay(null, 'Hospital A') // returns 'Hospital A'
 * ```
 */
export const perimeterDisplay = (source_value: string | null, name: string) => {
  return source_value ? `${source_value} - ${name}` : name
}
