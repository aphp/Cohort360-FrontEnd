import { AxiosResponse } from 'axios'
import { FhirResource, OperationOutcome } from 'fhir/r4'
import { FHIR_API_Response } from 'types'

export function getApiResponseResources<T extends FhirResource>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T[] | undefined {
  try {
    return getApiResponseResourcesOrThrow(response)
  } catch (e) {
    return undefined
  }
}

export function getApiResponseResourcesOrThrow<T extends FhirResource>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T[] {
  if (!response || !(response && response.data) || response.data.resourceType === 'OperationOutcome') {
    throw new Error(
      (response.data as OperationOutcome).issue.map((issue) => issue.details?.text || issue.code).join('\n')
    )
  }

  const a = response.data.entry ? response.data.entry.map((r) => r.resource).filter((r): r is T => undefined !== r) : []
  return a
}
