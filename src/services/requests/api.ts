import { RequestType } from 'types'
import services from '../aphp'

export type FetchRequestsResponse = {
  count: number
  selectedRequest?: null
  requestsList: RequestType[]
}

export const fetchRequests = async (limit: number = 5, offset: number = 0): Promise<FetchRequestsResponse> => {
  try {
    const requests = (await services.projects.fetchRequestsList(limit, offset)) || []
    return {
      count: requests.count,
      selectedRequest: null,
      requestsList: requests.results
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      selectedRequest: null,
      requestsList: []
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
