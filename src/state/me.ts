import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MeState = null | {
  id: string
  userName: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
}

const initialState: MeState = null

// Logout action is defined outside of the meSlice because it is being used by all reducers
export const logout = createAction('LOGOUT')

const meSlice = createSlice({
  name: 'me',
  initialState: initialState as MeState,
  reducers: {
    login: (state: MeState, action: PayloadAction<MeState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
  }
})

export default meSlice.reducer
export const { login } = meSlice.actions
