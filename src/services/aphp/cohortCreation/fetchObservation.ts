import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC, VALUE_SET_SIZE } from '../../../constants'
import { cleanValueSet } from 'utils/cleanValueSet'
import { ValueSet } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { displaySort, targetDisplaySort } from 'utils/alphabeticalSort'
import apiFhir from 'services/apiFhir'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchBiologyData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar

  if (!searchValue) {
    return []
  }

  if (searchValue === '*') {
    return [{ id: '*', label: 'Toute la hiérarchie', subItems: [{ id: 'loading', label: 'loading', subItems: [] }] }]
  }

  const _searchValue = noStar
    ? searchValue
      ? `&code=${searchValue.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
      : ''
    : searchValue
    ? `&_text=${encodeURIComponent(searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))}*` //eslint-disable-line
    : ''

  const res = await apiFhir.get<any>(
    `/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}${_searchValue}&size=${
      VALUE_SET_SIZE ?? 9999
    }`
  )

  const data =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource?.compose?.include[0].concept
      : []

  return cleanValueSet(data)
}

export const fetchBiologySearch = async (searchInput: string) => {
  if (!searchInput) {
    return {
      anabio: [],
      loinc: []
    }
  }

  const lowerCaseTrimmedSearchInput = searchInput.toLowerCase().trim()

  const res = await apiFhir.get<any>(
    `/ConceptMap?size=2000&context=Maps%20to,Hierarchy%20Concat%20Parents&source-uri=${BIOLOGY_HIERARCHY_ITM_ANABIO}&target-uri=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}&_text=${encodeURIComponent(
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

const filterUnwantedData = (biologyHierarchy: any) => {
  if (!biologyHierarchy) {
    return []
  }
  return biologyHierarchy.filter(
    (biologyItem: any) =>
      biologyItem.id !== '527941' &&
      biologyItem.id !== '547289' &&
      biologyItem.id !== '528247' &&
      biologyItem.id !== '981945' &&
      biologyItem.id !== '834019' &&
      biologyItem.id !== '528310' &&
      biologyItem.id !== '528049' &&
      biologyItem.id !== '527570' &&
      biologyItem.id !== '527614'
  )
}

export const fetchBiologyHierarchy = async (biologyParent?: string) => {
  if (!biologyParent) {
    const res = await apiFhir.get<any>(`/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO}`)

    let observationList =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    observationList =
      observationList && observationList.length > 0
        ? observationList.sort(displaySort).map((observationItem: ValueSet) => ({
            id: observationItem.code,
            label: `${capitalizeFirstLetter(observationItem.display)}`,
            subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
          }))
        : []

    const cleanObservationList = filterUnwantedData(observationList)

    return [{ id: '*', label: 'Toute la hiérarchie de Biologie', subItems: [...cleanObservationList] }]
  } else {
    const json = {
      resourceType: 'ValueSet',
      url: BIOLOGY_HIERARCHY_ITM_ANABIO,
      compose: {
        include: [
          {
            filter: [
              {
                op: 'is-a',
                value: biologyParent ?? ''
              }
            ]
          }
        ]
      }
    }

    const res = await apiFhir.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

    const observationList =
      res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
        ? res.data.expansion.contains
        : []

    return observationList.sort(displaySort).map((observationItem: ValueSet) => ({
      id: observationItem.code,
      label: `${capitalizeFirstLetter(observationItem.display)}`,
      subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
    }))
  }
}
