import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { RootState } from 'state'

import services from 'services/aphp'
import { AccessExpiration, User } from '../types'
import { IMPERSONATED_USER } from 'components/Impersonation'

export type MeState = null | {
  id: string
  userName: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
  accessExpirations: AccessExpiration[]
  nominativeGroupsIds?: string[]
  topLevelCareSites?: string[]
  lastConnection?: string
  maintenance?: { active: boolean; maintenance_end: string; maintenance_start: string }
  impersonation?: User
}

// Logout action is defined outside of the meSlice because it is being used by all reducers
const logout = createAsyncThunk<MeState, void, { state: RootState }>('scope/logout', async () => {
  services.practitioner.logout()
  return null
})

export const impersonate = createAction('me/impersonate', (user?: User) => {
  if (user) {
    localStorage.setItem(IMPERSONATED_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(IMPERSONATED_USER)
  }
  // this is bad but i don't know how to refresh the page after impersonation (which is sometimes needed to refresh the current page content/store)
  setTimeout(() => {
    window.location.reload()
  }, 1000)
  return {
    payload: { user }
  }
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
    builder.addCase(impersonate, (state, action) => {
      if (state) {
        return { ...state, impersonation: action.payload.user }
      }
      return state
    })
  }
})

export default meSlice.reducer
export { logout }
export const { login } = meSlice.actions
