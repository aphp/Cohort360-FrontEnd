import { createAction, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import jwt_decode from 'jwt-decode'

import { getIdToken } from 'services/arkhnAuth/oauth/tokenManager'
import { fetchPractitioner } from 'services/practitioner'
import { RootState } from 'state'

export type MeState = null | {
  id: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  deidentified: boolean
  nominativeGroupsIds?: any[]
  lastConnection?: string
  isSuperUser?: boolean
}

const initialState: MeState = null

// Logout action is defined outside of the meSlice because it is being used by all reducers
export const logout = createAction('LOGOUT')

export const fetchLoggedPractitioner = createAsyncThunk<MeState, void, { state: RootState }>(
  'me/fetchLoggedPractitoner',
  async (_, { dispatch, rejectWithValue }) => {
    const idToken = getIdToken()
    let state: MeState = null

    if (idToken) {
      const { email, name } = jwt_decode<{ email: string; name?: string }>(idToken)
      const practitioner = await fetchPractitioner(email)
      if (practitioner) {
        state = {
          ...practitioner,
          deidentified: name !== 'admin',
          isSuperUser: name === 'admin'
        }
      } else {
        dispatch(logout())
        return rejectWithValue(new Error('Practitioner not found'))
      }
    }

    return state
  }
)

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
    builder.addCase(fetchLoggedPractitioner.fulfilled, (state, { payload }) => {
      return payload
    })
  }
})

export default meSlice.reducer
export const { login } = meSlice.actions
