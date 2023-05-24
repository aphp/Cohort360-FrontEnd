import { AxiosResponse } from 'axios'
import { FhirResource } from 'fhir/r4'
import { FHIR_API_Response } from 'types'

export function getApiResponseResources<T extends FhirResource>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T[] | undefined {
  if (!response || !(response && response.data) || response.data.resourceType === 'OperationOutcome') return undefined

  const a = response.data.entry ? response.data.entry.map((r) => r.resource).filter((r): r is T => undefined !== r) : []
  return a
}
