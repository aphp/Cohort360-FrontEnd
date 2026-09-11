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
  Bundle,
  BundleEntry
} from 'fhir/r4'
import { FHIR_Bundle_Promise_Response, FHIR_API_Response } from 'types'
import {
  ExplorationResults,
  FetchOptions,
  FetchParams,
  Patient as PatientType,
  PMSI_INCLUDE_PAGE_SIZE
} from 'types/exploration'
import { getCodeList } from 'services/aphp/serviceValueSets'
import { getApiResponseResources } from './apiHelpers'
import {
  getBundleResources,
  getResourceInfos,
  getResourceInfosFromBundle,
  isEncounterResource,
  isPatientResource
} from './fillElement'
import { atLeastOneSearchCriteria } from './filters'
import { AxiosResponse } from 'axios'
import { getExtension } from './fhir'
import { linkElementWithEncounter } from './encounter'

const getPatientsCount = <T>(list: AxiosResponse<FHIR_API_Response<Bundle<T>>>, facet = 'unique-subject') => {
  return list?.data?.resourceType === 'Bundle'
    ? ((
        getExtension(list?.data?.meta, facet) || {
          valueDecimal: 0
        }
      ).valueDecimal ?? 0)
    : 0
}

export const fetchValueSet = async (valueSet: string) => {
  try {
    const { results } = await getCodeList(valueSet)
    return results
  } catch (error) {
    console.error(error)
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

export const narrowSearchCriterias = <T extends Filters>(
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

type NonPatientResource =
  | Condition
  | Procedure
  | Claim
  | Observation
  | ImagingStudy
  | QuestionnaireResponse
  | MedicationRequest
  | MedicationAdministration
  | DocumentReference

/**
 * Fetches a FHIR search in bounded `pageSize` chunks (via `_count`/`_offset`) and
 * concatenates the pages into a single Bundle-shaped response, instead of requesting
 * `size` results in one shot. Required for any request that also uses `_include`:
 * HAPI FHIR rejects a search (HAPI-0389) when too many base resources must be
 * resolved for `_include` in a single query, regardless of how large `size` is.
 *
 * When `size` already fits in one page, this issues the exact same single request
 * as before (no behavior change for existing bounded callers).
 */
export const fetchInPages = async <T extends Patient | NonPatientResource>(
  fetchPage: (size: number, offset: number) => FHIR_Bundle_Promise_Response<T>,
  size: number,
  offset = 0,
  pageSize: number = PMSI_INCLUDE_PAGE_SIZE
): FHIR_Bundle_Promise_Response<T> => {
  if (size <= pageSize) {
    return fetchPage(size, offset)
  }

  const targetOffset = offset + size
  let currentOffset = offset
  let combinedEntries: BundleEntry<T>[] = []

  // `size > pageSize` here, so `targetOffset > offset`: the loop always runs at
  // least once and `firstResponse` is always assigned before it is read below.
  const firstPageSize = Math.min(pageSize, targetOffset - currentOffset)
  const firstResponse = await fetchPage(firstPageSize, currentOffset)
  if (firstResponse.data.resourceType !== 'Bundle') return firstResponse
  combinedEntries = combinedEntries.concat(firstResponse.data.entry ?? [])
  currentOffset += firstPageSize

  // The real total (from the first page) bounds pagination independently of the
  // originally requested `size`, so a stale/over-estimated total never causes
  // over-fetching once the actual data is exhausted.
  const total = firstResponse.data.total ?? combinedEntries.length

  while (currentOffset < targetOffset && currentOffset < total) {
    const currentSize = Math.min(pageSize, targetOffset - currentOffset)
    const response = await fetchPage(currentSize, currentOffset)

    if (response.data.resourceType !== 'Bundle') return response

    combinedEntries = combinedEntries.concat(response.data.entry ?? [])
    currentOffset += currentSize
  }

  return {
    ...firstResponse,
    data: {
      ...firstResponse.data,
      entry: combinedEntries
    }
  }
}

export const fetcherWithParams = async <T extends Patient | NonPatientResource, F extends Filters>(
  fetchList: () => FHIR_Bundle_Promise_Response<T>,
  fetchAll: () => FHIR_Bundle_Promise_Response<T>,
  params: FetchParams &
    FetchOptions<F> & {
      facet?: string
      deidentified: boolean
      patient: PatientType | null
      groupId?: string[]
      isPatientData?: boolean
    }
): Promise<ExplorationResults<T>> => {
  const { filters, searchInput, orderBy, facet, patient, deidentified, groupId, isPatientData = false } = params
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
  if (isPatientData) {
    results.list = bundle
  } else {
    const includedResources = getBundleResources(list)
    const includedPatients = includedResources.filter(isPatientResource)
    const includedEncounters = includedResources.filter(isEncounterResource)

    const mainResources = (
      includedPatients.length > 0 || includedEncounters.length > 0
        ? bundle.filter((resource) => !isPatientResource(resource) && !isEncounterResource(resource))
        : bundle
    ) as NonPatientResource[]

    if (patient) {
      results.list = (await linkElementWithEncounter(mainResources, patient?.infos.hospits, deidentified)) as T[]
    } else if (includedEncounters.length > 0 && (deidentified || includedPatients.length > 0)) {
      results.list = (await getResourceInfosFromBundle(
        mainResources,
        deidentified,
        includedPatients,
        includedEncounters
      )) as T[]
    } else {
      results.list = (await getResourceInfos(mainResources, deidentified, groupId?.[0])) as T[]
    }
  }
  results.total = list?.data?.resourceType === 'Bundle' ? (list.data.total ?? 0) : 0
  results.totalAllResults = all && all?.data?.resourceType === 'Bundle' ? (all.data.total ?? 0) : results.total
  results.totalPatients = getPatientsCount(list, facet)
  results.totalAllPatients = all ? getPatientsCount(all, facet) : results.totalPatients
  results.meta = list.data.meta
  return results
}
