import { CONTEXT } from '../../constants'
import apiRequest from '../../services/apiRequest'
import { fakeValueSetCCAM /*fakeHierarchyCCAM*/ } from '../../data/fakeData/cohortCreation/procedure'
import { capitalizeFirstLetter } from '../../utils/capitalize'
import { codeSort } from '../../utils/alphabeticalSort'

export const fetchCcamData = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return fakeValueSetCCAM && fakeValueSetCCAM.length > 0
      ? fakeValueSetCCAM.map((_fakeValueSetCCAM: { code: string; display: string }) => ({
          id: _fakeValueSetCCAM.code,
          label: capitalizeFirstLetter(_fakeValueSetCCAM.display),
          subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
        }))
      : []
  } else {
    if (!searchValue) {
      return []
    }
    const _searchValue = noStar
      ? searchValue
        ? `&_text=${searchValue}`
        : ''
      : searchValue
      ? `&_text=${searchValue}*`
      : ''

    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-ccam${_searchValue}`)

    const CCAMObject = res && res.data && res.data.entry && res.data.resourceType === 'Bundle' ? res.data.entry : []

    const CCAMList =
      CCAMObject && CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM')
        ? CCAMObject.find((entry: any) => entry.resource.name === 'ORBIS - CCAM').resource.compose.include[0].concept
        : []

    return (
      CCAMList.sort(codeSort).map((ccamData: any) => ({
        id: ccamData.code,
        label: `${ccamData.code} - ${ccamData.display}`,
        subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
      })) || []
    )
  }
}

export const fetchCcamHierarchy = async (ccamParent: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    if (!ccamParent) {
      const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-ccam`)

      let CCAMList =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource.compose.include[0].concept
          : []

      CCAMList =
        CCAMList && CCAMList.length > 0
          ? CCAMList.sort(codeSort).map((ccamData: any) => ({
              id: ccamData.code,
              label: `${ccamData.code} - ${ccamData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return CCAMList
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: 'https://terminology.eds.aphp.fr/aphp-orbis-ccam',
        compose: {
          include: [
            {
              filter: [
                {
                  op: 'is-a',
                  value: ccamParent ?? ''
                }
              ]
            }
          ]
        }
      }

      const res = await apiRequest.post(`/ValueSet/$expand`, JSON.stringify(json))

      let CCAMList =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      CCAMList =
        CCAMList && CCAMList.length > 0
          ? CCAMList.sort(codeSort).map((ccamData: any) => ({
              id: ccamData.code,
              label: `${ccamData.code} - ${ccamData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return CCAMList
    }
  }
}
