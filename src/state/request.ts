import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { RequestType } from 'types'

import { logout, login, impersonate } from './me'

import services from 'services/aphp'

export type RequestState = {
  loading: boolean
  count: number
  selectedRequest: RequestType | null
  selectedRequestShare: RequestType | null
  requestsList: RequestType[]
}

const defaultInitialState: RequestState = {
  loading: false,
  count: 0,
  selectedRequest: null,
  selectedRequestShare: null,
  requestsList: []
}

type FetchRequestListReturn = {
  count: number
  selectedRequest: null
  requestsList: RequestType[]
}

const fetchRequests = createAsyncThunk<FetchRequestListReturn, void, { state: RootState }>(
  'request/fetchRequests',
  async () => {
    try {
      const requests = (await services.projects.fetchRequestsList({ limit: 100, offset: 0 })) || []

      let requestList = requests.results || []
      // requestList.length <= 100, check fetchRequestsList() for more information
      if (requests.count > requestList.length) {
        const newResult = await services.projects.fetchRequestsList({
          limit: requests.count - requestList.length,
          offset: requestList.length
        })
        // Add elements to requestList array and filter doublon
        requestList = [...requestList, ...(newResult.results || [])]
        requestList = requestList.filter((item, index, array) => {
          const foundItem = array.find(({ uuid }) => item.uuid === uuid)
          const currentIndex = foundItem ? array.indexOf(foundItem) : -1
          return index === currentIndex
        })
      }

      return {
        count: requests.count,
        selectedRequest: null,
        requestsList: requestList.reverse()
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)
/**
 * addRequest
 *
 */
type AddRequestParams = {
  newRequest: RequestType
}
type AddRequestReturn = {
  selectedRequest: null
  requestsList: RequestType[]
}

const addRequest = createAsyncThunk<AddRequestReturn, AddRequestParams, { state: RootState }>(
  'request/addRequest',
  async ({ newRequest }, { getState }) => {
    try {
      const state = getState().request
      const requestsList: RequestType[] = state.requestsList ?? []

      const createdRequest = await services.projects.addRequest(newRequest)

      return {
        count: state.count + 1,
        selectedRequest: null,
        requestsList: createdRequest !== null ? [...requestsList, createdRequest] : requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const setRequestSlice = createSlice({
  name: 'request',
  initialState: defaultInitialState,
  reducers: {
    setRequestsList: (state, action) => {
      state.requestsList = action.payload.requestsList
      state.count = action.payload.count
    },
    setSelectedRequest: (state: RequestState, action: PayloadAction<RequestType | null>) => {
      const requestsList: RequestType[] = state.requestsList ?? []
      const selectedRequest = action.payload
      const selectedRequestId = selectedRequest?.uuid
      const selectedProjectId = selectedRequest?.parent_folder

      if (selectedRequest === null) {
        return {
          ...state,
          selectedRequest: null
        }
      } else if (selectedRequestId) {
        const foundItem = requestsList.find(({ uuid }) => uuid === selectedRequestId)
        if (!foundItem) return state
        const index = requestsList.indexOf(foundItem)
        return {
          ...state,
          selectedRequest: requestsList[index]
        }
      } else {
        return {
          ...state,
          selectedRequest: {
            uuid: '',
            name: `Nouvelle requête ${requestsList.length + 1}`,
            parent_folder: selectedProjectId,
            description: ''
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    // fetchRequests
    builder.addCase(fetchRequests.pending, (state) => ({ ...state, loading: !state.count }))
    builder.addCase(fetchRequests.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(fetchRequests.rejected, (state) => ({ ...state, loading: false }))
    // addRequest
    builder.addCase(addRequest.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(addRequest.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(addRequest.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setRequestSlice.reducer
export { fetchRequests, addRequest }
export const { setRequestsList, setSelectedRequest } = setRequestSlice.actions
