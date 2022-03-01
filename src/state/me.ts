import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type MeState = null | {
  id: string
  userName: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
  nominativeGroupsIds?: any[]
  lastConnection?: string
}

// Logout action is defined outside of the meSlice because it is being used by all reducers
export const logout = createAction('LOGOUT')

const meSlice = createSlice({
  name: 'me',
  initialState: null as MeState,
  reducers: {
    login: (state: MeState, action: PayloadAction<MeState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => null)
  }
})

export default meSlice.reducer
export const { login } = meSlice.actions
