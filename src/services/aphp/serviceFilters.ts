import apiBackend from 'services/apiBackend'
import { RessourceType } from 'types/requestCriterias'

export const getProviderFilters = async (provider_source_value?: string, fhir_resource?: RessourceType) => {
  if (!provider_source_value || !fhir_resource) {
    return []
  }

  const filtersResp = await apiBackend.get(
    `/exports/fhir-filters/?owner_id=${provider_source_value}&fhir_resource=${fhir_resource}&ordering=-created_at&limit=1000`
  )

  if (filtersResp.status !== 200) {
    return []
  }

  return filtersResp.data.results ?? []
}
