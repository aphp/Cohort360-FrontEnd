/**
 * @fileoverview Utility functions for working with Maps and object key manipulation
 * @module utils/map
 */

/**
 * Creates a new Map with a replaced or added key-value pair
 *
 * @template K - The type of the map keys
 * @template V - The type of the map values
 * @param id - The key to set in the map
 * @param value - The value to associate with the key
 * @param map - The original map to copy and modify
 * @returns A new Map instance with the updated key-value pair
 *
 * @example
 * ```typescript
 * const originalMap = new Map([['a', 1], ['b', 2]]);
 * const newMap = replaceInMap('c', 3, originalMap);
 * // newMap contains ['a', 1], ['b', 2], ['c', 3]
 * ```
 */
export const replaceInMap = <K, V>(id: K, value: V, map: Map<K, V>) => {
  const newMap = new Map(map)
  newMap.set(id, value)
  return newMap
}

/**
 * Creates a new object with specified keys removed
 *
 * @template T - The type of the object
 * @param obj - The object to remove keys from
 * @param keys - Array of keys to remove from the object
 * @returns A new object with the specified keys removed
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const result = removeKeys(obj, ['b', 'c']);
 * // result is { a: 1 }
 * ```
 */
export const removeKeys = <T>(obj: T, keys: (keyof T)[]): T => {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}
