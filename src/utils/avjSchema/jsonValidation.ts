/**
 * @fileoverview Utility functions for processing json object created in Monaco editor
 * @module utils/abortController
 */

import { ErrorObject } from 'ajv'
import { SafeParseResult } from 'types/parsedJson'

/**
 * Parsing a given string which contains the serialize query
 *
 * @param controller - The serialize query in string format
 * @returns A a SafeParseResult instance
 *
 * ```
 */
export function safeJsonParse(text: string): SafeParseResult {
  try {
    return { ok: true, value: JSON.parse(text), error: null }
  } catch (e) {
    return {
      ok: false,
      value: null,
      error: e instanceof Error ? e.message : 'Invalid JSON'
    }
  }
}

/**
 * Format Avj errors after serialized query validation
 *
 * @param controller - The ErrorObject instance to format, or null
 * @returns A a string containing the error message
 *
 * ```
 */
export function formatAjvErrors(errors?: ErrorObject[] | null): string[] {
  if (!errors?.length) return []
  const msg = errors[0].message || 'Invaid JSON'
  const path = errors[0].instancePath
  const extra = errors[0].params ? ` (${JSON.stringify(errors[0].params)})` : ''
  return [` ${path} ${msg} ${extra}`]
}

const ENCOUNTER_PARAM_REGEX = /\bencounter\.[\w-]+/

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Find an `encounter.*` parameter in the filterFhir of a Biology (Observation) criterion.
 * Biology analyses are no longer linked to a stay, so these parameters are not available anymore.
 *
 * @param query - The parsed serialized query
 * @returns The name of the first `encounter.*` parameter found, or null
 *
 * ```
 */
export function findUnavailableBiologyParam(query: unknown): string | null {
  if (Array.isArray(query)) {
    for (const item of query) {
      const found = findUnavailableBiologyParam(item)
      if (found) return found
    }
    return null
  }
  if (!query || typeof query !== 'object') return null

  const { resourceType, filterFhir } = query as { resourceType?: unknown; filterFhir?: unknown }
  if (resourceType === 'Observation' && typeof filterFhir === 'string') {
    for (const param of filterFhir.split('&')) {
      const [key, ...rest] = param.split('=')
      const decodedKey = safeDecode(key)
      if (decodedKey.startsWith('encounter.')) return decodedKey
      if (decodedKey === '_filter') {
        const match = safeDecode(rest.join('=')).match(ENCOUNTER_PARAM_REGEX)
        if (match) return match[0]
      }
    }
  }

  return findUnavailableBiologyParam(Object.values(query))
}
