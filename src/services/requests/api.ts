import { RequestType } from 'types'
import services from '../aphp'
import { OrderBy } from 'types/searchCriterias'

export type FetchRequestsResponse = {
  count: number
  results: RequestType[]
}

export type FetchRequestsOptions = {
  orderBy: OrderBy
  limit: number
  text?: string
  next?: string
}

export const fetchRequests = async (options: FetchRequestsOptions): Promise<FetchRequestsResponse> => {
  try {
    const requests = (await services.projects.fetchRequestsList(options)) || []
    return {
      count: requests.count,
      results: requests.results
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      results: []
    }
  }
}

export const fetchRequestsFromProject = async (
  projectId: string,
  options: FetchRequestsOptions
): Promise<FetchRequestsResponse> => {
  try {
    const requests = (await services.projects.fetchRequestsFromProject(projectId, options)) || []
    return {
      count: requests.count,
      results: requests.results
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      results: []
    }
  }
}

export const editRequest = async (request: RequestType) => {
  try {
    await services.projects.editRequest(request)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteRequest = async (request: RequestType): Promise<void> => {
  try {
    await services.projects.deleteRequest(request)
  } catch (error) {
    console.error(error)
    throw error
  }
}
