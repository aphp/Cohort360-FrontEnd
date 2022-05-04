import { PROCEDURE_HIERARCHY, VALUE_SET_SIZE } from '../../../constants'
import apiRequest from 'services/apiRequest'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { codeSort } from 'utils/alphabeticalSort'

export const fetchCcamData = async (searchValue?: string, noStar?: boolean) => {
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
    `/ValueSet?url=${PROCEDURE_HIERARCHY}${_searchValue}&size=${VALUE_SET_SIZE ?? 9999}`
  )

  const data =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
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

export const fetchCcamHierarchy = async (ccamParent: string) => {
  if (!ccamParent) {
    const res = await apiRequest.get<any>(`/ValueSet?url=${PROCEDURE_HIERARCHY}`)

    let CCAMList =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
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
      url: PROCEDURE_HIERARCHY,
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

    const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

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
