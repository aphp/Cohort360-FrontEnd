/**
 * @fileoverview Warning dialog state slice.
 * Manages global warning/confirmation dialog state and actions.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * State interface for warning dialog functionality.
 */
export type WarningDialogState = {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Message to display in the dialog */
  message?: string
  /** Visual status/severity of the dialog */
  status?: 'success' | 'error' | 'warning'
  /** Callback function executed when user confirms */
  onConfirm?: () => void
}

/** Initial state for warning dialog */
const initialState = {
  isOpen: false,
  message: '',
  status: undefined,
  onConfirm: undefined
}

/**
 * Warning dialog slice managing global dialog state.
 *
 * Actions:
 * - showDialog: Displays dialog with specified message, status, and callback
 * - hideDialog: Hides dialog and resets state
 */
const setWarningDialogSlice = createSlice({
  name: 'warningDialog',
  initialState,
  reducers: {
    /**
     * Shows the warning dialog with specified configuration.
     *
     * @param state - Current dialog state
     * @param action - Action containing dialog configuration
     */
    showDialog: (state: WarningDialogState, action: PayloadAction<WarningDialogState>) => {
      state.isOpen = true
      state.message = action.payload.message
      state.status = action.payload.status
      state.onConfirm = action.payload.onConfirm
    },
    /**
     * Hides the dialog and resets all state to initial values.
     */
    hideDialog: () => initialState
  }
})

export default setWarningDialogSlice.reducer
export const { showDialog, hideDialog } = setWarningDialogSlice.actions
