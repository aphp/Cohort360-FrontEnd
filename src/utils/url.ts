/**
 * @fileoverview Utility functions for URL parameter handling and page validation
 * @module utils/url
 */

/**
 * Converts an array of parameter strings to a URL query string
 *
 * @param params - Array of parameter strings (e.g., ['key1=value1', 'key2=value2'])
 * @returns A formatted URL query string
 *
 * @example
 * ```typescript
 * mapParamsToNetworkParams(['page=1', 'size=10']) // returns '?page=1&size=10'
 * ```
 */
export const mapParamsToNetworkParams = (params: string[]) => {
  let url = ''
  params.forEach((item, index) => {
    url += index === 0 ? `?${item}` : `&${item}`
  })
  return url
}
