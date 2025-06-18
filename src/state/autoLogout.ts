/**
 * @fileoverview Auto logout state slice.
 * Manages the auto logout dialog state across the application.
 */

import { createSlice } from '@reduxjs/toolkit'

/**
 * State interface for auto logout functionality.
 */
interface autoLogoutState {
  /** Whether the auto logout dialog is currently open */
  isOpen: boolean
}

/** Initial state for auto logout */
const initialState = { isOpen: false } as autoLogoutState

/**
 * Auto logout slice managing session timeout dialog state.
 *
 * Actions:
 * - open: Shows the auto logout warning dialog
 * - close: Hides the auto logout warning dialog
 */
const autoLogoutSlice = createSlice({
  name: 'autoLogout',
  initialState,
  reducers: {
    /**
     * Opens the auto logout warning dialog.
     */
    open(state) {
      state.isOpen = true
      return state
    },
    /**
     * Closes the auto logout warning dialog.
     */
    close(state) {
      state.isOpen = false
      return state
    }
  }
})

export default autoLogoutSlice.reducer
export const { open, close } = autoLogoutSlice.actions
