import { CONTEXT, CLAIM_HIERARCHY } from '../../constants'
import apiRequest from 'services/apiRequest'
import { fakeValueSetGHM /*fakeHierarchyGHM*/ } from 'data/fakeData/cohortCreation/claim'
import { codeSort } from 'utils/alphabeticalSort'
import { capitalizeFirstLetter } from 'utils/capitalize'

export const fetchGhmData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetGHM && fakeValueSetGHM.length > 0
      ? fakeValueSetGHM.map((_fakeValueSetGHM: { code: string; display: string }) => ({
          id: _fakeValueSetGHM.code,
          label: capitalizeFirstLetter(_fakeValueSetGHM.display),
          subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
        }))
      : []
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

    const res = await apiRequest.get<any>(`/ValueSet?url=${CLAIM_HIERARCHY}${_searchValue}&size=0`)

    const data =
      res && res.data && res.data.entry && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    return data && data.length > 0
      ? data.sort(codeSort).map((_data: { code: string; display: string }) => ({
          id: _data.code,
          label: `${_data.code} - ${capitalizeFirstLetter(_data.display)}`,
          subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
        }))
      : []
  }
}

export const fetchGhmHierarchy = async (ghmParent: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    if (!ghmParent) {
      const res = await apiRequest.get<any>(`/ValueSet?url=${CLAIM_HIERARCHY}`)

      let GHMList =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource.compose.include[0].concept
          : []

      GHMList =
        GHMList && GHMList.length > 0
          ? GHMList.sort(codeSort).map((ghmData: any) => ({
              id: ghmData.code,
              label: `${ghmData.code} - ${ghmData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return GHMList
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: CLAIM_HIERARCHY,
        compose: {
          include: [
            {
              filter: [
                {
                  op: 'is-a',
                  value: ghmParent ?? ''
                }
              ]
            }
          ]
        }
      }

      const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

      let GHMList =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      GHMList =
        GHMList && GHMList.length > 0
          ? GHMList.sort(codeSort).map((ghmData: any) => ({
              id: ghmData.code,
              label: `${ghmData.code} - ${ghmData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return GHMList
    }
  }
}
