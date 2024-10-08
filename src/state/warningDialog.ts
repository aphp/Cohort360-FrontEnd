import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WarningDialogState = {
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
  name: 'warningDialog',
  initialState,
  reducers: {
    showDialog: (state: WarningDialogState, action: PayloadAction<WarningDialogState>) => {
      state.isOpen = true
      state.message = action.payload.message
      state.onConfirm = action.payload.onConfirm
    },
    hideDialog: () => initialState
  }
})

export default setWarningDialogSlice.reducer
export const { showDialog, hideDialog } = setWarningDialogSlice.actions
