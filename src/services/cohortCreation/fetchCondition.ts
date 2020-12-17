import apiRequest from '../../services/apiRequest'
import { alphabeticalSort } from 'utils/alphabeticalSort'

const DEFAULT_DIAGNOSTIC_TYPES = [
  {
    id: 'mp',
    label: 'manifestation morbide principale'
  },
  {
    id: 'fp',
    label: 'finalité principale de prise en charge'
  },
  {
    id: 'dp',
    label: 'diagnostic principal'
  },
  {
    id: 'das',
    label: 'diagnostic associé significatif'
  },
  {
    id: 'dr',
    label: 'diagnostic relié'
  },
  {
    id: 'ae',
    label: 'affection étiologique'
  },
  {
    id: 'dad',
    label: 'donnée à visée documentaire'
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
        id: cimType.display,
        label: `${cimType.code} - ${cimType.display}`
      }))
    : []
}

// todo: check if the data syntax is correct when available
export const fetchCim10Diagnostic = async (searchValue?: string) => {
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
