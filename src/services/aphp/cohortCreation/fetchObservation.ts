import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  BIOLOGY_HIERARCHY_ITM_LOINC,
  CONCEPT_MAP_HIERARCHY_EXTENSION_NAME
} from '../../../constants'
import { displaySort } from 'utils/alphabeticalSort'
import apiFhir from 'services/apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'
import { FHIR_Bundle_Response } from 'types'
import { ConceptMap } from 'fhir/r4'
import { ValueSet } from 'types/valueSet'

export type ValueSetWithHierarchy = ValueSet & { hierarchyDisplay: string }

export const fetchBiologySearch = async (
  searchInput: string
): Promise<{ anabio: ValueSetWithHierarchy[]; loinc: ValueSetWithHierarchy[] }> => {
  if (!searchInput) {
    return {
      anabio: [],
      loinc: []
    }
  }

  const lowerCaseTrimmedSearchInput = searchInput.toLowerCase().trim()

  const res = await apiFhir.get<FHIR_Bundle_Response<ConceptMap>>(
    `/ConceptMap?_count=2000&name=Maps%20to,Concept%20Fhir%20Maps%20To&source-system=${BIOLOGY_HIERARCHY_ITM_ANABIO}&target-system=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}&_text=${encodeURIComponent(
      lowerCaseTrimmedSearchInput.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
    )},${encodeURIComponent(
      `/(.)*${lowerCaseTrimmedSearchInput.replace(/[/"]/g, function (m) {
        switch (m) {
          case '/':
            return '\\/'
          case '"':
            return '\\"'
        }
        return m
      })}(.)*/`
    )}`
  )

  const data = getApiResponseResources(res)

  const loincResults = getSourceData(BIOLOGY_HIERARCHY_ITM_LOINC, data).sort(displaySort)
  const uniqueLoincResults = getUniqueLoincResults(loincResults)
  const anabioResults = getSourceData(BIOLOGY_HIERARCHY_ITM_ANABIO, data).sort(displaySort)

  return {
    anabio: anabioResults ?? [],
    loinc: uniqueLoincResults ?? []
  }
}

const getSourceData = (codeSystem: string, data?: ConceptMap[]): Array<ValueSetWithHierarchy> => {
  if (!data || data.length === 0) {
    return []
  }

  return (
    data
      .filter((element) => element.group?.[0].target === codeSystem)
      .map(
        (element) =>
          ({
            code: element.group?.[0].element?.[0].target?.[0].code,
            display: element.group?.[0].element?.[0].target?.[0].display,
            hierarchyDisplay: element.extension
              ?.find((e) => e.url === CONCEPT_MAP_HIERARCHY_EXTENSION_NAME)
              ?.valueString?.replaceAll(/\d+-|\w\d+-/g, '')
          } as ValueSetWithHierarchy)
      )
      .filter((el) => !!el) ?? []
  )
}

const getUniqueLoincResults = (loincResults: ValueSetWithHierarchy[]) => {
  if (loincResults.length === 0) {
    return []
  }

  return loincResults.filter(
    (
      (set) => (f) =>
        !set.has(f.code) && set.add(f.code)
    )(new Set())
  )
}
