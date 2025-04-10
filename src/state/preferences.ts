import { createSlice } from '@reduxjs/toolkit'
import { impersonate } from './me'

export type PreferenceState = {
  requests: {
    detailedMode: null | 'all' | 'ratio'
  }
}

const defaultInitialState: PreferenceState = {
  requests: {
    detailedMode: null
  }
}

const preferenceSlice = createSlice({
  name: 'preference',
  initialState: defaultInitialState,
  reducers: {
    setRequestDetailedMode: (
      state: PreferenceState,
      action: { payload: PreferenceState['requests']['detailedMode'] }
    ) => {
      return {
        ...state,
        requests: {
          ...state.requests,
          detailedMode: action.payload
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(impersonate, () => defaultInitialState)
  }
})

export default preferenceSlice.reducer
export const { setRequestDetailedMode } = preferenceSlice.actions
