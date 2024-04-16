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
