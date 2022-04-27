import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC } from '../../../constants'
import apiRequest from 'services/apiRequest'
import { cleanValueSet } from 'utils/cleanValueSet'

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
    ? `&_text=${searchValue.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}*` //eslint-disable-line
    : ''

  const res = await apiRequest.get<any>(
    `/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}${_searchValue}&size=0`
  )

  const data =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource?.compose?.include[0].concept
      : []

  return cleanValueSet(data)
}

export const fetchBiologyHierarchy = async (biologyParent?: string) => {
  if (!biologyParent) {
    const res = await apiRequest.get<any>(`/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO}`)

    const data =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return cleanValueSet(data)
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

    const data =
      res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
        ? res.data.expansion.contains
        : []

    return cleanValueSet(data)
  }
}
