export const replaceInMap = <K, V>(id: K, value: V, map: Map<K, V>) => {
  const newMap = new Map(map)
  newMap.set(id, value)
  return newMap
}
