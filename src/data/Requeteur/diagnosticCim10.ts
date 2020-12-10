import apiRequest from './apiRequest'
import diagnosticTypes from '../diagnosticTypes'

export const fetchStatusDiagnostic = async () => {
  const res = [
    {
      code: 'actif',
      display: 'Actif'
    },
    {
      code: 'supp',
      display: 'Supprimé'
    }
  ]
  return res
}

export const fetchDiagnosticTypes = async () => {
  const res = await apiRequest.get(`/ValueSet?url=https://terminology.eds.aphp.fr/aphp-orbis-condition_status`)
  let diagnosticKinds = []

  if (res) {
    diagnosticKinds = res.data.entry ? res.data.entry[0].resource.compose.include[0].concept : diagnosticTypes
  }

  return res ? diagnosticKinds : diagnosticTypes
}

export const fetchCim10Diagnostic = async (searchValue?: string) => {
  if (searchValue) {
    const res = await apiRequest.get(
      `/ValueSet?_text=${searchValue}&url=https://terminology.eds.aphp.fr/aphp-orbis-ccam`
    )

    const cim10List =
      res && res.data && res.data.entry && res.data.resourceType === 'Bundle'
        ? res.data.entry[0].resource.compose.include[0].concept
        : []

    return cim10List
  }

  return []
}
