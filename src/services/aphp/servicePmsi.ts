import { getConfig } from 'config'
import { fetchValueSet } from './callApi'

export const fetchConditionCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    getConfig().features.condition.valueSets.conditionHierarchy.url,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
export const fetchProcedureCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    getConfig().features.procedure.valueSets.procedureHierarchy.url,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}

export const fetchClaimCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    getConfig().features.claim.valueSets.claimHierarchy.url,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
