import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'

import services from 'services'

export type MeState = null | {
  id: string
  userName: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
  nominativeGroupsIds?: any[]
  lastConnection?: string
  maintenance?: { active: boolean; maintenance_end: string; maintenance_start: string }
}

// Logout action is defined outside of the meSlice because it is being used by all reducers
const logout = createAsyncThunk<MeState, void, { state: RootState }>('scope/logout', async () => {
  services.practitioner.logout()
  return null
})

const meSlice = createSlice({
  name: 'me',
  initialState: null as MeState,
  reducers: {
    login: (state: MeState, action: PayloadAction<MeState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () => null)
    builder.addCase(logout.rejected, () => null)
  }
})

export default meSlice.reducer
export { logout }
export const { login } = meSlice.actions
