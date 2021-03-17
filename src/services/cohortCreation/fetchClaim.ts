import { CONTEXT } from '../../constants'
import apiRequest from '../../services/apiRequest'
import { fakeValueSetGHM /*fakeHierarchyGHM*/ } from '../../data/fakeData/cohortCreation/claim'
import { codeSort } from '../../utils/alphabeticalSort'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchGhmData = async (searchValue?: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetGHM && fakeValueSetGHM.length > 0
      ? fakeValueSetGHM.map((_fakeValueSetGHM: { code: string; display: string }) => ({
          id: _fakeValueSetGHM.code,
          label: capitalizeFirstLetter(_fakeValueSetGHM.display)
        }))
      : []
  } else {
    if (!searchValue) {
      return []
    }
    const _searchValue = searchValue ? `&_text=${searchValue}*` : ''
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-ghm${_searchValue}`)

    const data =
      res && res.data && res.data.entry && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource.compose.include[0].concept
        : []

    return data && data.length > 0
      ? data.sort(codeSort).map((_data: { code: string; display: string }) => ({
          id: _data.code,
          label: capitalizeFirstLetter(_data.display)
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
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-ghm`)

      let GHMList =
        res && res.data && res.data.entry && res.data.entry[1] && res.data.resourceType === 'Bundle'
          ? res.data.entry[1].resource.compose.include[0].concept
          : []

      GHMList =
        GHMList && GHMList.length > 0
          ? GHMList.sort(codeSort).map((ghmData: any) => ({
              id: ghmData.code,
              label: `${ghmData.code} - ${ghmData.display}`
            }))
          : []
      return GHMList
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-ghm',
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

      const res = await apiRequest.post(`/ValueSet/$expand`, JSON.stringify(json))

      let GHMList =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      GHMList =
        GHMList && GHMList.length > 0
          ? GHMList.sort(codeSort).map((ghmData: any) => ({
              id: ghmData.code,
              label: `${ghmData.code} - ${ghmData.display}`
            }))
          : []
      return GHMList
    }
  }
}
