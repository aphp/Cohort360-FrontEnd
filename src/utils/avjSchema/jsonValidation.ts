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
  const path = errors[0].dataPath
  const extra = errors[0].params ? ` (${JSON.stringify(errors[0].params)})` : ''
  return [` ${path} ${msg} ${extra}`]
}
