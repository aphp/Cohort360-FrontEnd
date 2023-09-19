import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC } from '../../../constants'
import { targetDisplaySort } from 'utils/alphabeticalSort'
import apiFhir from 'services/apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchBiologySearch = async (searchInput: string) => {
  if (!searchInput) {
    return {
      anabio: [],
      loinc: []
    }
  }

  const lowerCaseTrimmedSearchInput = searchInput.toLowerCase().trim()

  const res = await apiFhir.get<any>(
    `/ConceptMap?_count=2000&context=Maps%20to,Hierarchy%20Concat%20Parents&source-system=${BIOLOGY_HIERARCHY_ITM_ANABIO}&target-system=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}&_text=${encodeURIComponent(
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

  const loincResults = getSourceData('Maps to', data).sort(targetDisplaySort)
  const uniqueLoincResults = getUniqueLoincResults(loincResults)
  const anabioResults = getSourceData('Hierarchy Concat Parents', data).sort(targetDisplaySort)
  const cleanAnabioResults = getCleanAnabioResults(anabioResults)

  return {
    anabio: cleanAnabioResults ?? [],
    loinc: uniqueLoincResults ?? []
  }
}

// TODO: change type any
const getSourceData = (context: string, data: any) => {
  if (data.length === 0) {
    return []
  }

  return (
    data
      .filter((element: any) => element.description === context)
      .map((element: any) => element.group?.[0].element?.[0]) ?? []
  )
}

// TODO: change type any
const getUniqueLoincResults = (loincResults: any[]) => {
  if (loincResults.length === 0) {
    return []
  }

  return loincResults.filter(
    (
      (set) => (f: any) =>
        !set.has(f.target[0].code) && set.add(f.target[0].code)
    )(new Set())
  )
}

const getCleanAnabioResults = (anabioResults: any[]) => {
  return anabioResults.map((anabioResult) => {
    const cleanAnabioHierarchy = anabioResult.target?.[0]?.display.replaceAll(/\d+-|\w\d+-/g, '')

    return {
      ...anabioResult,
      target: [
        {
          code: anabioResult.target[0].code,
          display: cleanAnabioHierarchy
        }
      ]
    }
  })
}
