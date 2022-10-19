import { createSlice } from '@reduxjs/toolkit'

interface autoLogoutState {
  isOpen: boolean
}

const initialState = { isOpen: false } as autoLogoutState

const autoLogoutSlice = createSlice({
  name: 'autoLogout',
  initialState,
  reducers: {
    open(state) {
      state.isOpen = true
      return state
    },
    close(state) {
      state.isOpen = false
      return state
    }
  }
})

export default autoLogoutSlice.reducer
export const { open, close } = autoLogoutSlice.actions
