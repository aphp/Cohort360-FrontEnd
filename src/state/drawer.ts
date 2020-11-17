import { createSlice } from '@reduxjs/toolkit'

const initialState = true

const drawerSlice = createSlice({
  name: 'drawer',
  initialState,
  reducers: {
    open: () => {
      return true
    },
    close: () => {
      return false
    }
  }
})

export default drawerSlice.reducer
export const { open, close } = drawerSlice.actions
