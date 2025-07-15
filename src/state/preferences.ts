/**
 * @fileoverview User preferences state slice.
 * Manages user-specific preferences and settings across the application.
 */

import { createSlice } from '@reduxjs/toolkit'
import { impersonate } from './me'

/**
 * State interface for user preferences.
 */
export type PreferenceState = {
  /** Request-related preferences */
  requests: {
    /** Detailed mode setting for requests display **/
    detailedMode: null | 'all' | 'ratio'
  }
}

/** Initial state for user preferences */
const defaultInitialState: PreferenceState = {
  requests: {
    detailedMode: null
  }
}

/**
 * Preferences slice managing user-specific settings.
 *
 * Actions:
 * - setRequestDetailedMode: Sets the detailed mode preference for requests
 *
 * Extra Reducers:
 * - Resets preferences on user impersonation
 */
const preferenceSlice = createSlice({
  name: 'preference',
  initialState: defaultInitialState,
  reducers: {
    /**
     * Sets the detailed mode preference for request displays.
     *
     * @param state - Current preferences state
     * @param action - Action containing new detailed mode setting
     */
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
