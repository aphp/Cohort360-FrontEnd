import { Filters, SearchCriterias } from 'types/searchCriterias'
import { removeKeys } from './map'
import {
  MedicationRequest,
  MedicationAdministration,
  QuestionnaireResponse,
  ImagingStudy,
  Observation,
  DocumentReference,
  Patient,
  Claim,
  Condition,
  Procedure,
  Bundle
} from 'fhir/r4'
import { FHIR_Bundle_Promise_Response, FHIR_API_Response } from 'types'
import { Data, DataType, ExplorationResults, FetchOptions, FetchParams } from 'types/exploration'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { linkElementWithEncounter, PatientState } from 'state/patient'
import { getApiResponseResources } from './apiHelpers'
import { getResourceInfos } from './fillElement'
import { atLeastOneSearchCriteria } from './filters'
import { AxiosResponse } from 'axios'
import { getExtension } from './fhir'

const getPatientsCount = <T>(list: AxiosResponse<FHIR_API_Response<Bundle<T>>>, facet = 'unique-subject') => {
  return list?.data?.resourceType === 'Bundle'
    ? (
        getExtension(list?.data?.meta, facet) || {
          valueDecimal: 0
        }
      ).valueDecimal ?? 0
    : 0
}

export const fetchValueSet = async (valueSet: string) => {
  try {
    const { results } = await getCodeList(valueSet)
    return results
  } catch (e) {
    return []
  }
}

export const resolveAdditionalInfos = async <T extends object>(
  fetchersMap: Partial<{ [K in keyof T]: () => Promise<T[K]> }>
): Promise<Partial<T>> => {
  const results = await Promise.all(
    Object.entries(fetchersMap).map(async ([key, fetchFn]) => {
      const typedKey = key as keyof T
      const value = await (fetchFn as () => Promise<T[keyof T]>)()
      return { key: typedKey, value }
    })
  )
  return results.reduce((acc, { key, value }) => {
    if (value !== undefined) acc[key] = value
    return acc
  }, {} as Partial<T>)
}

export const narrowSearchCriterias = <T>(
  deidentified: boolean,
  searchCriterias: SearchCriterias<T>,
  isPatient: boolean,
  filtersToRemove: (keyof T)[],
  criteriasToRemove: (keyof SearchCriterias<T>)[]
): SearchCriterias<T> => {
  const alwaysRemoved: (keyof T)[] = [
    ...(deidentified ? (['ipp', 'nda'] as (keyof T)[]) : []),
    ...(isPatient ? (['ipp'] as (keyof T)[]) : [])
  ]
  const filters = removeKeys(searchCriterias.filters, [...filtersToRemove, ...alwaysRemoved])
  const narrowedCriterias = removeKeys(searchCriterias, criteriasToRemove)
  return { ...narrowedCriterias, filters }
}

export const getCommonParamsList = ({ page, size, orderBy, searchInput }: FetchParams, groupId: string[]) => {
  return {
    size,
    offset: page ? (page - 1) * size : 0,
    _sort: orderBy.orderBy,
    sortDirection: orderBy.orderDirection,
    _text: searchInput,
    _list: groupId
  }
}

export const getCommonParamsAll = (groupId: string[]) => {
  return {
    size: 0,
    _list: groupId
  }
}

export const fetcherWithParams = async <
  T /*| Patient*/ extends
    | Condition
    | Procedure
    | Claim
    | Observation
    | ImagingStudy
    | QuestionnaireResponse
    | MedicationRequest
    | MedicationAdministration
    | DocumentReference,
  F extends Filters
>(
  fetchList: () => FHIR_Bundle_Promise_Response<T>,
  fetchAll: () => FHIR_Bundle_Promise_Response<T>,
  params: FetchParams &
    FetchOptions<F> & { facet?: string; deidentified: boolean; patient?: PatientState; groupId?: string[] }
): Promise<ExplorationResults<T>> => {
  const { filters, searchInput, orderBy, facet, patient, deidentified, groupId } = params
  const [list, all] = await Promise.all([
    fetchList(),
    atLeastOneSearchCriteria({ searchInput, orderBy, filters }) ? fetchAll() : null
  ])
  const results: ExplorationResults<T> = {
    totalAllResults: 0,
    total: 0,
    totalAllPatients: 0,
    totalPatients: 0,
    list: []
  }
  const bundle = getApiResponseResources(list) ?? []
  results.list = patient
    ? linkElementWithEncounter(bundle, patient?.hospits?.list ?? [], deidentified)
    : await getResourceInfos(bundle, deidentified, groupId?.[0])
  results.total = list?.data?.resourceType === 'Bundle' ? list.data.total ?? 0 : 0
  results.totalAllResults = all && all?.data?.resourceType === 'Bundle' ? all.data.total ?? 0 : results.total
  results.totalPatients = getPatientsCount(list, facet)
  results.totalAllPatients = all ? getPatientsCount(all) : results.totalPatients
  results.meta = list.data.meta
  return results
}
