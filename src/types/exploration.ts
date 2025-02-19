import { ResourceType } from './requestCriterias'
import { SearchCriterias } from './searchCriterias'

export type ResourceOptions<T> = {
  deidentified: boolean
  page: number
  searchCriterias: SearchCriterias<T>
  type?: ResourceType
  groupId?: string
  includeFacets?: boolean
}
