import { IPractitionerRole, IPractitioner, IOrganization } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from 'services/api'
import { RootState } from 'state'
import { FHIR_API_Response } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'

export type PractitionerConsent = IPractitionerRole & {
  extension: {
    valueCode: 'pending' | 'validated' | 'refused' | 'inactive'
  }
}

export type AccessRequestState = {
  authors: IPractitioner[]
  practitionerRoles: IPractitionerRole[]
  organizations: IOrganization[]
}

const fetchAccessRequests = createAsyncThunk<AccessRequestState, void, { state: RootState }>(
  'fetchAccessRequests',
  async (_, { getState }) => {
    const practitionerId = getState().me?.id
    if (!practitionerId) throw new Error('Error: Could not get practitioner id')

    const pendingRequestsData = getApiResponseResources(
      await api.get<FHIR_API_Response<IPractitionerRole | IPractitioner | IOrganization>>(
        //TODO Wrong request
        `PractitionerRole?&_include:PractitionerRole:practitioner&_include:PractitionerRole:organization`
      )
    )

    if (!pendingRequestsData) throw new Error('Error: Could not fetch access requests')

    return {
      authors: pendingRequestsData.filter(({ resourceType }) => resourceType === 'Practitioner') as IPractitioner[],
      practitionerRoles: pendingRequestsData.filter(
        ({ resourceType }) => resourceType === 'PractitionerRole'
      ) as IPractitionerRole[],
      organizations: pendingRequestsData.filter(
        ({ resourceType }) => resourceType === 'Organization'
      ) as IOrganization[]
    }
  }
)

const createAccessRequest = createAsyncThunk<void, void, { state: RootState }>(
  'createAccessRequest',
  async (_, { getState }) => {
    const state = getState()
    const practitionerId = state.me?.id
    const practitionerOrganizationIds = state.me?.organizations?.map((o) => o.id) ?? []
    // We get all organization ids selected for the cohort
    const selectedOrganizationIds = state.cohortCreation.request.selectedPopulation?.map((o) => o.id) ?? []

    // Then we filter those not in the practitioner's perimeter
    const outOfPerimeterOrgaIds = selectedOrganizationIds.filter((id) => !practitionerOrganizationIds.includes(id))

    // Mock data
    const mockIds = ['836729c0-91d8-5dec-a96c-d9e86c01836d']

    if (!practitionerId) throw new Error('Practitioner not logged')

    // Create as many PractitionerRole as "out of scope" organizations
    const accessResources: IPractitionerRole[] = mockIds.map((orgaId) => ({
      resourceType: 'PractitionerRole',
      meta: {
        lastUpdated: new Date().toISOString()
      },
      // code: 'pending'
      practitioner: {
        reference: `Practitioner/${practitionerId}`
      },
      organization: {
        reference: `Organization/${orgaId}`
      },
      extension: [
        {
          valueCode: `pending`
        }
      ]
    }))

    await Promise.all(accessResources.map((resource) => api.post(`PractitionerRole`, resource)))
  }
)

const initialState: AccessRequestState = {
  authors: [],
  practitionerRoles: [],
  organizations: []
}

const AccessRequestSlice = createSlice({
  name: 'accessRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAccessRequests.fulfilled, (state, { payload }) => {
      return payload
    })
  }
})

export default AccessRequestSlice.reducer
export { fetchAccessRequests, createAccessRequest }
