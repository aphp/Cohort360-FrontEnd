import { mapSearchCriteriasToRequestParams } from 'mappers/filters'
import apiBackend from 'services/apiBackend'
import { ResourceType } from 'types/requestCriterias'
import { deleteFilter, deleteFilters, getFilters, patchFilters, postFilters } from './callApi'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { isIdentifyingFilter } from '../../utils/fhirFilterParser'

export const getProviderFilters = async (provider_source_value?: string, fhir_resource?: ResourceType) => {
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

export const postFiltersService = async (
  fhir_resource: ResourceType,
  name: string,
  criterias: SearchCriterias<Filters>,
  deidentified: boolean
) => {
  const criteriasString = mapSearchCriteriasToRequestParams(criterias, fhir_resource, deidentified)
  let identifying = false

  // in pseudo mode, users do not get to interact with identifying fields, so not possible to save
  // an identifying filter. Only check in case of nomi mode
  if (!deidentified) {
    identifying = isIdentifyingFilter(criteriasString)
  }

  const response = await postFilters(fhir_resource, name, criteriasString, identifying)
  if (response.status < 200 || response.status >= 300) throw new Error()
  return response.data
}

export const getFiltersService = async (fhir_resource: ResourceType, next?: string | null, limit = 10) => {
  const LIMIT = limit
  const OFFSET = 0
  const response = await getFilters(fhir_resource, LIMIT, OFFSET, next)
  if (response.status < 200 || response.status >= 300) throw new Error()
  return response.data
}

export const deleteFilterService = async (fhir_resource_uuid: string) => {
  const response = await deleteFilter(fhir_resource_uuid)
  if (response.status < 200 || response.status >= 300) throw new Error()
  return response
}

export const deleteFiltersService = async (fhir_resource_uuids: string[]) => {
  const response = await deleteFilters(fhir_resource_uuids)
  if (response.status < 200 || response.status >= 300) throw new Error()
  return response
}

export const patchFiltersService = async (
  fhir_resource: ResourceType,
  uuid: string,
  name: string,
  criterias: SearchCriterias<Filters>,
  deidentified: boolean
) => {
  const criteriasString = mapSearchCriteriasToRequestParams(criterias, fhir_resource, deidentified)
  const response = await patchFilters(fhir_resource, uuid, name, criteriasString)
  if (response.status < 200 || response.status >= 300) throw new Error()
  return response
}
