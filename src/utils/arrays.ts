import { WithId } from 'types/arrays'

export const addOrRemoveElement = <T, S>(toAdd: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toAdd.id)
  if (existingIndex > -1) {
    elems.splice(existingIndex, 1)
  } else {
    elems.push(toAdd)
  }
  return elems
}

export const addElement = <T, S>(toAdd: WithId<T, S>, elems: WithId<T, S>[]) => {
  elems.push(toAdd)
  return [...elems]
}

export const removeElement = <T, S>(toAdd: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toAdd.id)
  if (existingIndex > -1) {
    elems.splice(existingIndex, 1)
  }
  return [...elems]
}

export const isFound = <T, S>(toSearch: WithId<T, S>, elems: WithId<T, S>[]) => {
  const existingIndex = elems.findIndex((elem) => elem.id === toSearch.id)
  if (existingIndex > -1) {
    return true
  }
  return false
}

export const arrayToMap = <T, S>(array: T[], value: S): Map<T, S> => {
  const resultMap = new Map<T, S>()
  for (const str of array) {
    resultMap.set(str, value)
  }
  return resultMap
}

export const sort = <T extends { [key: string]: any }>(array: T[], attr: keyof T): T[] => {
  try {
    array.sort((a, b) => a[attr].localeCompare(b[attr]))
  } catch {
    console.error('Empty item.')
  }
  return array
}
