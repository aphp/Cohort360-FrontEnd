import apiRequest from '../../services/apiRequest'
import { alphabeticalSort } from 'utils/alphabeticalSort'

const DEFAULT_DIAGNOSTIC_TYPES = [
  {
    code: 'mp',
    display: 'manifestation morbide principale'
  },
  {
    code: 'fp',
    display: 'finalité principale de prise en charge'
  },
  {
    code: 'dp',
    display: 'diagnostic principal'
  },
  {
    code: 'das',
    display: 'diagnostic associé significatif'
  },
  {
    code: 'dr',
    display: 'diagnostic relié'
  },
  {
    code: 'ae',
    display: 'affection étiologique'
  },
  {
    code: 'dad',
    display: 'donnée à visée documentaire'
  }
]

export const fetchStatusDiagnostic = async () => {
  const res = [
    {
      id: 'actif',
      label: 'Actif'
    },
    {
      id: 'supp',
      label: 'Supprimé'
    }
  ]
  return res
}

export const fetchDiagnosticTypes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-condition_status`)

  const diagnosticKinds =
    res && res.data && res.data.entry && res.data.entry[0]
      ? res.data.entry[0].resource.compose.include[0].concept
      : DEFAULT_DIAGNOSTIC_TYPES

  return diagnosticKinds && diagnosticKinds.length > 0
    ? diagnosticKinds.sort(alphabeticalSort).map((cimType: any) => ({
        id: cimType.code,
        label: `${cimType.code} - ${cimType.display}`
      }))
    : []
}

// todo: check if the data syntax is correct when available
export const fetchCim10Diagnostic = async (searchValue?: string) => {
  if (!searchValue) {
    return []
  }
  const _searchValue = searchValue ? `&_text=${searchValue}` : ''
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-cim${_searchValue}`)

  let cim10List =
    res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
      ? res.data.entry[0].resource.compose.include[0].concept
      : []

  cim10List =
    cim10List && cim10List.length > 0
      ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
          id: cimData.code,
          label: `${cimData.code} - ${cimData.display}`
        }))
      : []
  return cim10List
}

export const fetchCim10Hierarchy = async (cim10Parent: string) => {
  if (!cim10Parent) {
    const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-cim`)

    let cim10List =
      res && res.data && res.data.entry && res.data.entry[0] && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource.compose.include[0].concept
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`
          }))
        : []
    return cim10List
  } else {
    const json = {
      resourceType: 'ValueSet',
      url: 'https://terminology.eds.aphp.fr/aphp-orbis-cim-',
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

    const res = await apiRequest.post(`/ValueSet/$expand`, JSON.stringify(json))

    let cim10List =
      res && res.data && res.data.expansion && res.data.expansion.contains && res.data.resourceType === 'ValueSet'
        ? res.data.expansion.contains
        : []

    cim10List =
      cim10List && cim10List.length > 0
        ? cim10List.sort(alphabeticalSort).map((cimData: any) => ({
            id: cimData.code,
            label: `${cimData.code} - ${cimData.display}`
          }))
        : []
    return cim10List
  }
}
