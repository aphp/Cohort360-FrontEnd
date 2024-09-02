import { getConfig } from 'config'
import { fetchValueSet } from './callApi'

export const fetchAnabioCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    getConfig().features.observation.valueSets.biologyHierarchyLoinc.url,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}

export const fetchLoincCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    getConfig().features.observation.valueSets.biologyHierarchyLoinc.url,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
