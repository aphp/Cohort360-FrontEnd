import { IOrganization } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createAction, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import jwt_decode from 'jwt-decode'

import { getIdToken } from 'services/arkhnAuth/oauth/tokenManager'
import { fetchPractitioner } from 'services/practitioner'
import { RootState } from 'state'
import { getPractitionerPerimeters } from 'services/perimeters'
import { PRACTITIONER_ID } from '../constants'

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
  organizations?: (IOrganization & { patientCount: number })[]
}

const initialState: MeState = null

// Logout action is defined outside of the meSlice because it is being used by all reducers
export const logout = createAction('LOGOUT')

export const fetchPractitionerData = createAsyncThunk<MeState, void, { state: RootState }>(
  'me/fetchLoggedPractitoner',
  async (_, { dispatch, rejectWithValue }) => {
    const idToken = getIdToken()
    let state: MeState = null

    if (idToken) {
      const { email, name } = jwt_decode<{ email: string; name?: string }>(idToken)
      const practitioner = await fetchPractitioner(email)
      if (practitioner) {
        localStorage.setItem(PRACTITIONER_ID, practitioner.id)
        const organizations = await getPractitionerPerimeters(practitioner.id)
        state = {
          ...practitioner,
          organizations,
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

export const fetchPractitionerPerimeter = createAsyncThunk<
  (IOrganization & { patientCount: number })[],
  void,
  { state: RootState }
>('me/fetchPractitionerPerimeter', async (_, { getState }) => {
  const practitionerId = getState().me?.id

  if (!practitionerId) {
    return []
  }

  const organizations = await getPractitionerPerimeters(practitionerId)
  return organizations ?? []
})

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
      localStorage.removeItem(PRACTITIONER_ID)
      return initialState
    })
    builder.addCase(fetchPractitionerData.fulfilled, (state, { payload }) => {
      return payload
    })
    builder.addCase(fetchPractitionerPerimeter.fulfilled, (state, { payload }) => {
      if (state) {
        state.organizations = payload
      }
    })
  }
})

export default meSlice.reducer
export const { login } = meSlice.actions
