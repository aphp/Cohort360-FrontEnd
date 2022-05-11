import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC, VALUE_SET_SIZE } from '../../../constants'
import apiRequest from 'services/apiRequest'
import { cleanValueSet } from 'utils/cleanValueSet'
import { ValueSet } from 'types'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { displaySort } from 'utils/alphabeticalSort'
// import apiFhir from 'services/apiFhir'
// import { getApiResponseResources } from 'utils/apiHelpers'
// import { targetDisplaySort } from 'utils/alphabeticalSort'

export const fetchBiologyData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar

  if (!searchValue) {
    return []
  }

  const _searchValue = noStar
    ? searchValue
      ? `&code=${searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
      : ''
    : searchValue
    ? `&_text=${encodeURIComponent(searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))}*` //eslint-disable-line
    : ''

  const res = await apiRequest.get<any>(
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

// export const fetchBiologySearch = async (searchInput: string) => {
//   const _searchInput = searchInput ?? 'gly'
//   const res = await apiFhir.get<any>(
//     `/ConceptMap?size=2000&context=Maps%20to,Hierarchy%20Concat%20Parents&source-uri=${BIOLOGY_HIERARCHY_ITM_ANABIO}&target-uri=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}&_text=${encodeURIComponent(
//       _searchInput.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
//     )}*`
//   )

//   const data = getApiResponseResources(res)

//   const loincResults = getSourceData('Maps to', data).sort(targetDisplaySort)
//   const uniqueLoincResults = getUniqueLoincResults(loincResults)
//   const anabioResults = getSourceData('Hierarchy Concat Parents', data).sort(targetDisplaySort)
//   const cleanAnabioResults = getCleanAnabioResults(anabioResults)

//   return {
//     anabio: cleanAnabioResults ?? [],
//     loinc: uniqueLoincResults ?? []
//   }
// }

// TODO: change type any
// const getSourceData = (context: string, data: any) => {
//   if (data.length === 0) {
//     return []
//   }

//   const sourceData =
//     data
//       .filter((element: any) => element.description === context)
//       .map((element: any) => element.group?.[0].element?.[0]) ?? []

//   return sourceData
// }

// // TODO: change type any
// const getUniqueLoincResults = (loincResults: any[]) => {
//   if (loincResults.length === 0) {
//     return []
//   }

//   const loincUniqueResults = loincResults.filter(
//     (
//       (set) => (f: any) =>
//         !set.has(f.target[0].code) && set.add(f.target[0].code)
//     )(new Set())
//   )

//   return loincUniqueResults
// }

// const getCleanAnabioResults = (anabioResults: any[]) => {
//   return anabioResults.map((anabioResult) => {
//     const values = anabioResult.target[0].display.split('|')

//     const lastValues = values[values.length - 1].split('-')
//     const cleanAnabio = `${lastValues[1]}-${lastValues[2]}}`
//     values.pop()
//     values.push(cleanAnabio)
//     const anabioHierarchy = values.join('|')

//     return {
//       ...anabioResult,
//       target: [
//         {
//           code: anabioResult.target[0].code,
//           display: anabioHierarchy
//         }
//       ]
//     }
//   })
// }

export const fetchBiologyHierarchy = async (biologyParent?: string) => {
  if (!biologyParent) {
    const res = await apiRequest.get<any>(`/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO}`)

    const observationList =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return observationList.sort(displaySort).map((observationItem: ValueSet) => ({
      id: observationItem.code,
      label: `${capitalizeFirstLetter(observationItem.display)}`,
      subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
    }))
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

    const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

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
