import { CLAIM_HIERARCHY, CONDITION_HIERARCHY, PROCEDURE_HIERARCHY } from '../../constants'
import { fetchValueSet } from './callApi'

export const fetchConditionCodes = async (text: string, exactSearch = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    CONDITION_HIERARCHY,
    { joinDisplayWithCode: false, search: text, exactSearch: exactSearch },
    signal
  )
  return (response.results || []).map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
export const fetchProcedureCodes = async (text: string, exactSearch = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    PROCEDURE_HIERARCHY,
    { joinDisplayWithCode: false, search: text, exactSearch: exactSearch },
    signal
  )
  return (response.results || []).map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}

export const fetchClaimCodes = async (text: string, exactSearch = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    CLAIM_HIERARCHY,
    { joinDisplayWithCode: false, search: text, exactSearch: exactSearch },
    signal
  )
  return (response.results || []).map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
