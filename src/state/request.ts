import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { RequestType } from 'types'

import { logout, login } from './me'

import services from 'services'

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
  async (DO_NOT_USE, { getState }) => {
    try {
      const state = getState().request

      const oldRequestList = state.requestsList || []
      const requests = (await services.projects.fetchRequestsList(100, 0)) || []

      if (state.count === requests.count) {
        return {
          count: state.count,
          selectedRequest: null,
          requestsList: oldRequestList
        }
      }

      let requestList = requests.results || []
      // requestList.length <= 100, check fetchRequestsList() for more information
      if (requests.count > requestList.length) {
        const newResult = await services.projects.fetchRequestsList(
          requests.count - requestList.length,
          requestList.length
        )
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
        selectedRequest: null,
        requestsList: createdRequest !== null ? [...requestsList, createdRequest] : requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * editRequest
 *
 */
type EditRequestParams = {
  editedRequest: RequestType
}
type EditRequestReturn = {
  selectedRequest: null
  requestsList: RequestType[]
}

const editRequest = createAsyncThunk<EditRequestReturn, EditRequestParams, { state: RootState }>(
  'request/editRequest',
  async ({ editedRequest }, { getState, dispatch }) => {
    try {
      const state = getState().request
      // eslint-disable-next-line
      let requestsList: RequestType[] = state.requestsList ? [...state.requestsList] : []
      const foundItem = requestsList.find(({ uuid }) => uuid === editedRequest.uuid)
      if (!foundItem) {
        // if not found -> create it
        dispatch(addRequest({ newRequest: editedRequest }))
      } else {
        const index = requestsList.indexOf(foundItem)

        const modifiedRequest = await services.projects.editRequest(editedRequest)

        requestsList[index] = modifiedRequest
      }
      return {
        selectedRequest: null,
        requestsList: requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * deleteRequest
 *
 */
type DeleteRequestParams = {
  deletedRequest: RequestType
}
type DeleteRequestReturn = {
  selectedRequest: null
  requestsList: RequestType[]
}

const deleteRequest = createAsyncThunk<DeleteRequestReturn, DeleteRequestParams, { state: RootState }>(
  'request/deleteRequest',
  async ({ deletedRequest }, { getState, dispatch }) => {
    try {
      const state = getState().request
      // eslint-disable-next-line
      let requestsList: RequestType[] = state.requestsList ? [...state.requestsList] : []
      const foundItem = requestsList.find(({ uuid }) => uuid === deletedRequest.uuid)
      const index = foundItem ? requestsList.indexOf(foundItem) : -1
      if (index !== -1) {
        // delete item at index
        await services.projects.deleteRequest(deletedRequest)

        requestsList.splice(index, 1)
      }

      dispatch<any>(fetchRequests())

      return {
        selectedRequest: null,
        requestsList: requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * moveRequests
 *
 */
type MoveRequestParams = {
  selectedRequests: RequestType[]
  parent_folder: string | undefined
}
type MoveRequestReturn = {
  selectedRequest: null
  requestsList: RequestType[]
}

const moveRequests = createAsyncThunk<MoveRequestReturn, MoveRequestParams, { state: RootState }>(
  'request/moveRequests',
  async ({ selectedRequests, parent_folder }, { getState }) => {
    try {
      const state = getState().request
      let requestsList: RequestType[] = state.requestsList ? [...state.requestsList] : []

      const results = await services.projects.moveRequests(selectedRequests, parent_folder ?? '')

      requestsList = requestsList.map((requestItem) => {
        const foundItem = results.find((result) => result.uuid === requestItem.uuid)
        if (foundItem) {
          return {
            ...requestItem,
            parent_folder
          }
        } else {
          return requestItem
        }
      })

      return {
        selectedRequest: null,
        requestsList: requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * deleteRequests
 *
 */
type DeleteRequestsParams = {
  deletedRequests: RequestType[]
}
type DeleteRequestsReturn = {
  selectedRequest: null
  requestsList: RequestType[]
}

const deleteRequests = createAsyncThunk<DeleteRequestsReturn, DeleteRequestsParams, { state: RootState }>(
  'request/deleteRequests',
  async ({ deletedRequests }, { getState }) => {
    try {
      const state = getState().request
      let requestsList: RequestType[] = state.requestsList ? [...state.requestsList] : []

      const results = await services.projects.deleteRequests(deletedRequests)

      requestsList = requestsList.filter((requestItem) => {
        const foundItem = results.find((result) => result.uuid === requestItem.uuid)
        return foundItem === undefined
      })

      return {
        selectedRequest: null,
        requestsList: requestsList
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const setRequestSlice = createSlice({
  name: 'request',
  initialState: defaultInitialState as RequestState,
  reducers: {
    clearRequest: () => {
      return defaultInitialState
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
    },
    setSelectedRequestShare: (state: RequestState, action: PayloadAction<RequestType | null>) => {
      const requestsList: RequestType[] = state.requestsList ?? []
      const selectedRequestShare = action.payload
      const selectedRequestShareId = selectedRequestShare?.uuid

      if (selectedRequestShare === null) {
        return {
          ...state,
          selectedRequestShare: null
        }
      } else {
        if (selectedRequestShareId) {
          const foundItem = requestsList.find(({ uuid }) => uuid === selectedRequestShareId)
          if (!foundItem) {
            return state
          } else {
            const index = requestsList.indexOf(foundItem)
            return {
              ...state,
              selectedRequestShare: {
                uuid: requestsList[index].uuid,
                name: requestsList[index].name,
                query_snapshots: requestsList[index].query_snapshots,
                shared_query_snapshot: requestsList[index].query_snapshots?.slice(-1)
              }
            }
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    // fetchRequests
    builder.addCase(fetchRequests.pending, (state) => ({ ...state, loading: !state.count }))
    builder.addCase(fetchRequests.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(fetchRequests.rejected, (state) => ({ ...state, loading: false }))
    // addRequest
    builder.addCase(addRequest.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(addRequest.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(addRequest.rejected, (state) => ({ ...state, loading: false }))
    // editRequest
    builder.addCase(editRequest.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(editRequest.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(editRequest.rejected, (state) => ({ ...state, loading: false }))
    // deleteRequest
    builder.addCase(deleteRequest.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteRequest.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(deleteRequest.rejected, (state) => ({ ...state, loading: false }))
    // moveRequests
    builder.addCase(moveRequests.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(moveRequests.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(moveRequests.rejected, (state) => ({ ...state, loading: false }))
    // deleteRequests
    builder.addCase(deleteRequests.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(deleteRequests.fulfilled, (state, action) => ({ ...state, ...action.payload, loading: false }))
    builder.addCase(deleteRequests.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default setRequestSlice.reducer
export { fetchRequests, addRequest, editRequest, deleteRequest, moveRequests, deleteRequests }
export const { clearRequest, setSelectedRequest, setSelectedRequestShare } = setRequestSlice.actions
