import { displaySort } from 'utils/alphabeticalSort'
import apiFhir from 'services/apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'
import { FHIR_Bundle_Response, ValueSet } from 'types'
import { ConceptMap } from 'fhir/r4'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'

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
    `/ConceptMap?_count=2000&name=Maps%20to,Concept%20Fhir%20Maps%20To&source-system=${
      getConfig().features.observation.valueSets.biologyHierarchyAnabio.url
    }&target-system=${getConfig().features.observation.valueSets.biologyHierarchyAnabio.url},${
      getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
    }&_text=${encodeURIComponent(
      lowerCaseTrimmedSearchInput.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
    )}`
  )

  const data = getApiResponseResources(res)

  const loincResults = getSourceData(getConfig().features.observation.valueSets.biologyHierarchyLoinc.url, data).sort(
    displaySort
  )
  const uniqueLoincResults = getUniqueLoincResults(loincResults)
  const anabioResults = getSourceData(getConfig().features.observation.valueSets.biologyHierarchyAnabio.url, data).sort(
    displaySort
  )

  return {
    anabio: anabioResults ?? [],
    loinc: uniqueLoincResults ?? []
  }
}

const getSourceData = (codeSystem: string, data?: ConceptMap[]): Array<ValueSetWithHierarchy> => {
  const conceptMapHierarchyExtension = getConfig().core.extensions.conceptMapHierarchy
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
            hierarchyDisplay: getExtension(element, conceptMapHierarchyExtension)?.valueString?.replaceAll(
              /\d+-|\w\d+-/g,
              ''
            )
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
