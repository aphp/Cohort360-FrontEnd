export const replaceInMap = <K, V>(id: K, value: V, map: Map<K, V>) => {
  const newMap = new Map(map)
  newMap.set(id, value)
  return newMap
}

export const removeKeys = <T>(obj: T, keys: (keyof T)[]): T => {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}
