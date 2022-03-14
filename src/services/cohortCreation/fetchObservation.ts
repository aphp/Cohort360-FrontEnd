import { BIOLOGY_HIERARCHY_ITM_ANABIO, BIOLOGY_HIERARCHY_ITM_LOINC, CONTEXT } from '../../constants'
import apiRequest from '../apiRequest'
import { codeSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'

export const fetchBiologyData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar

  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
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

    return data && data.length > 0
      ? data.sort(codeSort).map((_data: { code: string; display: string }) => ({
          id: _data.code,
          // label: `${_data.code} - ${capitalizeFirstLetter(_data.display)}`,
          label: capitalizeFirstLetter(_data.display),
          subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
        }))
      : []
  }
}

export const fetchBiologyHierarchy = async (biologyParent?: string) => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    if (!biologyParent) {
      const res = await apiRequest.get<any>(`/ValueSet?url=${BIOLOGY_HIERARCHY_ITM_ANABIO}`)

      let anabioList =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource?.compose?.include[0].concept
          : []

      anabioList =
        anabioList && anabioList.length > 0
          ? anabioList.sort(codeSort).map((anabioData: any) => ({
              id: anabioData.code,
              // label: `${anabioData.code} - ${anabioData.display}`,
              label: anabioData.display,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return anabioList
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

      let anabioList =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      anabioList =
        anabioList && anabioList.length > 0
          ? anabioList.sort(codeSort).map((anabioData: any) => ({
              id: anabioData.code,
              // label: `${anabioData.code} - ${anabioData.display}`,
              label: anabioData.display,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return anabioList
    }
  }
}
