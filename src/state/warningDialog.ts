import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ConfirmationDialogState = {
  isOpen: boolean
  message?: string
  onConfirm?: () => void
}

const initialState = {
  isOpen: false,
  message: '',
  onConfirm: undefined
}

const setWarningDialogSlice = createSlice({
  name: 'confirmationDialog',
  initialState,
  reducers: {
    showDialog: (state: ConfirmationDialogState, action: PayloadAction<ConfirmationDialogState>) => {
      state.isOpen = true
      state.message = action.payload.message
      state.onConfirm = action.payload.onConfirm
    },
    hideDialog: () => initialState
  }
})

export default setWarningDialogSlice.reducer
export const { showDialog, hideDialog } = setWarningDialogSlice.actions
