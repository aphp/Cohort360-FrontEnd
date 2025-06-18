/**
 * @fileoverview Criteria configuration state slice.
 * Manages criteria configuration data used throughout the application.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout } from 'state/me'

import { CriteriaItemType } from 'types'

/**
 * State interface for criteria configuration.
 */
export type CriteriaState = {
  /** Configuration object mapping criteria keys to partial criteria definitions */
  config: {
    [criteriaKey: string]: Partial<CriteriaItemType>
  }
}

/** Initial state for criteria configuration */
const defaultInitialState = {
  config: {}
} as CriteriaState

/**
 * Criteria slice managing criteria configuration data.
 *
 * Actions:
 * - setCriteriaData: Sets the complete criteria configuration
 *
 * Extra Reducers:
 * - Resets state on login/logout events
 */
const criteriaSlice = createSlice({
  name: 'criteria',
  initialState: defaultInitialState,
  reducers: {
    /**
     * Sets the complete criteria configuration data.
     *
     * @param state - Current criteria state
     * @param action - Action containing new criteria configuration
     */
    setCriteriaData: (state: CriteriaState, action: PayloadAction<CriteriaState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
  }
})

export default criteriaSlice.reducer
export const { setCriteriaData } = criteriaSlice.actions
