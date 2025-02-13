import { ResourceType } from './requestCriterias'
import { SearchCriterias } from './searchCriterias'

export type ResourceOptions<T> = {
  options: {
    deidentified: boolean
    page: number
    searchCriterias: SearchCriterias<T>
    type?: ResourceType
  }
}
