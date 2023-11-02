import { CLAIM_HIERARCHY, CONDITION_HIERARCHY, PROCEDURE_HIERARCHY } from '../../constants'
import services from '.'
import { fetchValueSet } from './callApi'

export const fetchDiagnosticTypes = async () => {
  try {
    const diagnosticTypes = await services.cohortCreation.fetchDiagnosticTypes()
    return diagnosticTypes
  } catch (e) {
    return []
  }
}

export const fetchConditionCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    CONDITION_HIERARCHY,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response
}
export const fetchProcedureCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    PROCEDURE_HIERARCHY,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response
}

export const fetchClaimCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    CLAIM_HIERARCHY,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response
}
