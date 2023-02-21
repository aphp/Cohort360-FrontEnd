import { IResourceList } from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response } from 'types'
import { AxiosResponse } from 'axios'

export function getApiResponseResources<T extends IResourceList>(
  response: AxiosResponse<FHIR_API_Response<T>>
): T[] | undefined {
  if (!response || !(response && response.data) || response.data.resourceType === 'OperationOutcome') return undefined

  return response.data.entry ? response.data.entry.map((r) => r.resource).filter((r): r is T => undefined !== r) : []
}
