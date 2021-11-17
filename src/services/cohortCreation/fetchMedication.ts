import { CONTEXT, MEDICATION_ATC, MEDICATION_PRESCRIPTION_TYPES, MEDICATION_ADMINISTRATIONS } from '../../constants'
import apiRequest from '../apiRequest'
import { cleanValueSet } from 'utils/cleanValueSet'
import { codeSort } from '../../utils/alphabeticalSort'
import { capitalizeFirstLetter } from '../../utils/capitalize'

export const fetchAtcData = async (searchValue?: string, noStar?: boolean) => {
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

    const res = await apiRequest.get<any>(`/ValueSet?url=${MEDICATION_ATC}${_searchValue}&size=0`)

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

export const fetchAtcHierarchy = async (atcParent: string) => {
  if (CONTEXT === 'arkhn') {
    return null
  } else if (CONTEXT === 'fakedata') {
    return null
  } else {
    if (!atcParent) {
      const res = await apiRequest.get<any>(`/ValueSet?url=${MEDICATION_ATC}`)

      let ATCList =
        res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
          ? res.data.entry[0].resource.compose.include[0].concept
          : []

      ATCList =
        ATCList && ATCList.length > 0
          ? ATCList.sort(codeSort)
              .map((atcData: any) => ({
                id: atcData.code,
                label: `${atcData.code} - ${atcData.display}`,
                subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
              }))
              // V--[ @TODO: This is a hot fix, remove this after a clean of data ]--V
              .filter((atcData: any) => atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1)
              .filter((atcData: any) => atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0)
          : []
      return ATCList
    } else {
      const json = {
        resourceType: 'ValueSet',
        url: MEDICATION_ATC,
        compose: {
          include: [
            {
              filter: [
                {
                  op: 'is-a',
                  value: atcParent ?? ''
                }
              ]
            }
          ]
        }
      }

      const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

      let ATCList =
        res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
          ? res.data.expansion.contains
          : []

      ATCList =
        ATCList && ATCList.length > 0
          ? ATCList.sort(codeSort).map((atcData: any) => ({
              id: atcData.code,
              label: `${atcData.code} - ${atcData.display}`,
              subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
            }))
          : []
      return ATCList
    }
  }
}

export const fetchPrescriptionTypes = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${MEDICATION_PRESCRIPTION_TYPES}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      if (data && data.length > 0) {
        return cleanValueSet(data)
      } else {
        return []
      }
    } catch (error) {
      return []
    }
  }
}

export const fetchAdministrations = async () => {
  if (CONTEXT === 'arkhn') {
    return []
  } else if (CONTEXT === 'fakedata') {
    return []
  } else {
    try {
      const res = await apiRequest.get<any>(`/ValueSet?url=${MEDICATION_ADMINISTRATIONS}`)
      const data = res.data.entry[0].resource?.compose?.include[0].concept || []

      if (data && data.length > 0) {
        return cleanValueSet(data)
      } else {
        return []
      }
    } catch (error) {
      return []
    }
  }
}
