import { CONDITION_HIERARCHY, CONDITION_STATUS, VALUE_SET_SIZE } from '../../../constants'
import apiRequest from 'services/apiRequest'
import { codeSort } from 'utils/alphabeticalSort'

export const fetchStatusDiagnostic = async () => {
  return [
    {
      id: 'actif',
      label: 'Actif'
    },
    {
      id: 'supp',
      label: 'Supprimé'
    }
  ]
}

export const fetchDiagnosticTypes = async () => {
  const res = await apiRequest.get<any>(`/ValueSet?url=${CONDITION_STATUS}`)

  const diagnosticKinds =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource?.compose?.include[0].concept
      : []

  return diagnosticKinds && diagnosticKinds.length > 0
    ? diagnosticKinds.sort(codeSort).map((cimType: any) => ({
        id: cimType.code,
        label: `${cimType.code} - ${cimType.display}`
      }))
    : []
}

export const fetchCim10Diagnostic = async (searchValue?: string, noStar?: boolean) => {
  noStar = noStar === undefined ? true : noStar
  if (!searchValue) {
    return []
  }
  const _searchValue = noStar
    ? searchValue
      ? `&code=${searchValue.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}` //eslint-disable-line
      : ''
    : searchValue
    ? `&_text=${encodeURIComponent(searchValue.trim().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'))}*` //eslint-disable-line
    : ''

  const res = await apiRequest.get<any>(
    `/ValueSet?url=${CONDITION_HIERARCHY}${_searchValue}&size=${VALUE_SET_SIZE ?? 9999}`
  )

  let cim10List =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource?.compose?.include[0].concept
      : []

  cim10List =
    cim10List && cim10List.length > 0
      ? cim10List.sort(codeSort).map((cimData: any) => ({
          id: cimData.code,
          label: `${cimData.code} - ${cimData.display}`
        }))
      : []
  return cim10List
}

export const fetchCim10Hierarchy = async (cim10Parent: string) => {
  if (!cim10Parent) {
    const res = await apiRequest.get<any>(`/ValueSet?url=${CONDITION_HIERARCHY}`)

    let cim10List =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource?.compose?.include[0].concept
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(codeSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`,
            subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
          }))
        : []
    return cim10List
  } else {
    const json = {
      resourceType: 'ValueSet',
      url: CONDITION_HIERARCHY,
      compose: {
        include: [
          {
            filter: [
              {
                op: 'is-a',
                value: cim10Parent ?? ''
              }
            ]
          }
        ]
      }
    }

    const res = await apiRequest.post<any>(`/ValueSet/$expand`, JSON.stringify(json))

    let cim10List =
      res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
        ? res.data.expansion.contains
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(codeSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`,
            subItems: [{ id: 'loading', label: 'loading', subItems: [] }]
          }))
        : []
    return cim10List
  }
}
