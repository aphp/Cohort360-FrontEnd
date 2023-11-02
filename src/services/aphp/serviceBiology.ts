import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC } from '../../constants'
import { fetchValueSet } from './callApi'

export const fetchAnabioCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    BIOLOGY_HIERARCHY_ITM_ANABIO,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}

export const fetchLoincCodes = async (text: string, noStar = false, signal?: AbortSignal) => {
  const response = await fetchValueSet(
    BIOLOGY_HIERARCHY_ITM_LOINC,
    { joinDisplayWithCode: false, search: text, noStar: noStar },
    signal
  )
  return response.map((elem) => {
    return { ...elem, label: `${elem.id} - ${elem.label}` }
  })
}
