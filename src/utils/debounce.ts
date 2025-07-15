/**
 * @fileoverview React hook for debouncing values
 * @module utils/debounce
 */

import { useState, useEffect } from 'react'

/**
 * Custom React hook that debounces a value, delaying its update until after the specified delay
 *
 * @param delay - The delay in milliseconds before updating the debounced value
 * @param value - The value to debounce
 * @returns The debounced value
 *
 * @example
 * ```typescript
 * const Component = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(500, searchTerm);
 *
 *   // debouncedSearchTerm will only update 500ms after the user stops typing
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search
 *     }
 *   }, [debouncedSearchTerm]);
 * };
 * ```
 */
export const useDebounce = (delay: number, value: string): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value])

  return debouncedValue
}
