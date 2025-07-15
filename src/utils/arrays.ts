/**
 * @fileoverview Utility functions for array manipulation with ID-based operations
 * @module utils/arrays
 */

import { WithId } from 'types/arrays'

/**
 * Adds an element to an array if it doesn't exist, or removes it if it does (toggle behavior)
 *
 * @template T - The type of the element data
 * @template S - The type of the element ID
 * @param toAdd - The element to add or remove
 * @param elems - The array to modify
 * @returns The modified array
 *
 * @example
 * ```typescript
 * const items = [{ id: 1, name: 'item1' }];
 * addOrRemoveElement({ id: 2, name: 'item2' }, items);
 * // items now contains both item1 and item2
 * addOrRemoveElement({ id: 1, name: 'item1' }, items);
 * // items now only contains item2
 * ```
 */
export const addOrRemoveElement = <T, S>(toAdd: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toAdd.id)
  if (existingIndex > -1) {
    elems.splice(existingIndex, 1)
  } else {
    elems.push(toAdd)
  }
  return elems
}

/**
 * Adds an element to an array and returns a new array
 *
 * @template T - The type of the element data
 * @template S - The type of the element ID
 * @param toAdd - The element to add
 * @param elems - The array to add to
 * @returns A new array containing all original elements plus the new one
 */
export const addElement = <T, S>(toAdd: WithId<T, S>, elems: WithId<T, S>[]) => {
  elems.push(toAdd)
  return [...elems]
}

/**
 * Removes an element from an array based on its ID and returns a new array
 *
 * @template T - The type of the element data
 * @template S - The type of the element ID
 * @param toRemove - The element to remove
 * @param elems - The array to remove from
 * @returns A new array with the element removed
 */
export const removeElement = <T, S>(toRemove: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toRemove.id)
  if (existingIndex > -1) {
    elems.splice(existingIndex, 1)
  }
  return [...elems]
}

/**
 * Checks if an element exists in an array based on its ID
 *
 * @template T - The type of the element data
 * @template S - The type of the element ID
 * @param toSearch - The element to search for
 * @param elems - The array to search in
 * @returns True if the element is found, false otherwise
 */
export const isFound = <T, S>(toSearch: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toSearch.id)
  if (existingIndex > -1) {
    return true
  }
  return false
}

/**
 * Converts an array to a Map with all elements having the same value
 *
 * @template T - The type of the array elements (used as keys)
 * @template S - The type of the value assigned to each key
 * @param array - The array to convert
 * @param value - The value to assign to each key
 * @returns A new Map with array elements as keys and the provided value for each
 */
export const arrayToMap = <T, S>(array: T[], value: S): Map<T, S> => {
  const resultMap = new Map<T, S>()
  for (const str of array) {
    resultMap.set(str, value)
  }
  return resultMap
}

/**
 * Sorts an array of objects by a specified attribute using locale-aware string comparison
 *
 * @template T - The type of objects in the array
 * @param array - The array to sort
 * @param attr - The attribute to sort by
 * @returns The sorted array
 *
 * @example
 * ```typescript
 * const items = [{ name: 'zebra' }, { name: 'apple' }];
 * sortArray(items, 'name');
 * // items is now [{ name: 'apple' }, { name: 'zebra' }]
 * ```
 */
export const sortArray = <T extends { [key: string]: any }>(array: T[], attr: keyof T): T[] => {
  try {
    array.sort((a, b) => a[attr].localeCompare(b[attr]))
  } catch {
    console.error('Empty item.')
  }
  return array
}
