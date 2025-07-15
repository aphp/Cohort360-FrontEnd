/**
 * @fileoverview Utility functions for pagination and URL parameter handling
 * @module utils/paginationUtils
 */

/**
 * Cleans and validates a group ID string by filtering out invalid values
 *
 * @param groupId - The group ID string to clean, or null
 * @returns The cleaned group ID string, or undefined if invalid
 *
 * @example
 * ```typescript
 * getCleanGroupId('123,456,789') // returns '123,456,789'
 * getCleanGroupId('123,abc,456') // returns '123,456'
 * getCleanGroupId(null) // returns undefined
 * ```
 */
export const getCleanGroupId = (groupId: string | null) => {
  if (groupId === null) return undefined
  const cleanGroupId = groupId.split(',').filter((value) => !!value && RegExp(/^\d+$/).exec(value))

  return cleanGroupId.length > 0 ? cleanGroupId.join() : undefined
}

/**
 * Props for cleanSearchParams function
 */
type cleanSearchParamsProps = {
  /** The page number as a string */
  page: string
  /** Optional tab ID */
  tabId?: string
  /** Optional group ID string */
  groupId?: string
}

/**
 * Cleans and validates search parameters, ensuring group IDs are properly formatted
 *
 * @param params - The search parameters to clean
 * @returns Cleaned search parameters object with validated values
 *
 * @example
 * ```typescript
 * cleanSearchParams({ page: '1', groupId: '123,456', tabId: 'tab1' })
 * // returns { page: '1', groupId: '123,456', tabId: 'tab1' }
 * ```
 */
export const cleanSearchParams = (params: cleanSearchParamsProps) => {
  const { page, tabId, groupId } = params
  return {
    ...(groupId && getCleanGroupId(groupId) && { groupId: getCleanGroupId(groupId) }),
    page: page,
    ...(tabId && { tabId })
  }
}
