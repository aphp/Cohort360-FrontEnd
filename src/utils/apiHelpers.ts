import { AxiosResponse } from 'axios'
import { FhirResource, OperationOutcome, Resource } from 'fhir/r4'
import { FHIR_API_Response, FHIR_Bundle_Response } from 'types'

export function getApiResponseResource<T extends FhirResource>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T | undefined {
  try {
    return getApiResponseResourceOrThrow(response)
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export function getApiResponseResources<T extends FhirResource>(
  response: AxiosResponse<FHIR_Bundle_Response<T>>
): T[] | undefined {
  try {
    return getApiResponseResourcesOrThrow(response)
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export function getApiResponseResourceOrThrow<T extends FhirResource>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T {
  return getResponseDataOrThrow(response, (data) => {
    return data
  })
}

export function getApiResponseResourcesOrThrow<T extends FhirResource>(
  response: AxiosResponse<FHIR_Bundle_Response<T>>
): T[] {
  return getResponseDataOrThrow(response, (data) => {
    return data.entry ? data.entry.map((r) => r.resource).filter((r): r is T => undefined !== r) : []
  })
}

export function getResponseDataOrThrow<T extends Resource, R>(
  response: AxiosResponse<FHIR_API_Response<T>>,
  responseMapper: (response: T) => R
): R {
  if (!response || !(response && response.data) || response.data.resourceType === 'OperationOutcome') {
    throw new Error(
      (response.data as OperationOutcome).issue.map((issue) => issue.details?.text || issue.code).join('\n')
    )
  }

  return responseMapper(response.data as T)
}

export function getAllResults<
  T extends FhirResource,
  U extends { offset?: number; size?: number; signal?: AbortSignal }
>(
  fetcher: (params: U) => Promise<AxiosResponse<FHIR_Bundle_Response<T>>>,
  fetcherParams: U,
  updateCompletion?: (stage: number, total: number) => void
): Promise<T[]> {
  const size = fetcherParams.size || 100
  const fetch = async (offset: number): Promise<T[]> => {
    const response = await fetcher({
      ...fetcherParams,
      offset,
      size,
      signal: fetcherParams.signal
    })
    const data = getApiResponseResourceOrThrow(response)
    const results = data.entry ? data.entry.map((r) => r.resource).filter((r): r is T => undefined !== r) : []
    const total = data.total || results.length
    if (updateCompletion) {
      updateCompletion((offset + size) / size, Math.ceil(total / size))
    }
    if (total > offset + size) {
      return results.concat(await fetch(offset + size))
    }
    return results
  }
  return fetch(0)
}
