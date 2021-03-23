import { IPractitionerRole, IPractitioner, IOrganization } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

import api from 'services/api'
import { RootState } from 'state'
import { FHIR_API_Response } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'

export type AccessRequestState = {
  authors: IPractitioner[]
  practitionerRoles: IPractitionerRole[]
  organizations: IOrganization[]
}

const fetchAccessRequests = createAsyncThunk<AccessRequestState, void, { state: RootState }>(
  'fetchAccessRequests',
  async (_, { getState }) => {
    const meState = getState().me
    const practitionerId = meState?.id
    const isSuperUser = meState?.isSuperUser
    if (!practitionerId) throw new Error('Error: Could not get practitioner id')

    const pendingRequestsData = isSuperUser
      ? getApiResponseResources(
          await api.get<FHIR_API_Response<IPractitionerRole | IPractitioner | IOrganization>>(
            `PractitionerRole?permission-status=proposed&_include=PractitionerRole:practitioner&_include=PractitionerRole:organization&_count=500`
          )
        )
      : []

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

    // const mockOrgaIds = ['87ef5490-e3bc-5e5a-9748-58f22a05b5dd', 'b02deefc-62e4-5c13-8a00-8203d4229cb0']

    if (!practitionerId) throw new Error('Practitioner not logged')

    // Create as many PractitionerRole as "out of scope" organizations
    const accessResources: IPractitionerRole[] = outOfPerimeterOrgaIds.map((orgaId) => ({
      resourceType: 'PractitionerRole',
      id: uuid(),
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
          url: 'http://arkhn.com/fhir/cohort360/StructureDefinition/permission-status',
          valueCode: `proposed`
        }
      ]
    }))

    await Promise.all(accessResources.map((resource) => api.post(`PractitionerRole`, resource)))
  }
)

const updateAccessRequest = createAsyncThunk<void, IPractitionerRole, { state: RootState }>(
  'updateAccessRequest',
  async (practitionerRole, { dispatch, getState }) => {
    const originalPractitionerRole = getState().accessRequests.practitionerRoles.find(
      ({ id }) => id === practitionerRole.id
    )

    if (!originalPractitionerRole) throw new Error('Could not find original practitionerRole to update')

    const updateRequest = await api.put(`PractitionerRole/${practitionerRole.id}`, {
      ...originalPractitionerRole,
      ...practitionerRole
    })

    if (updateRequest.status === 200) {
      dispatch(fetchAccessRequests())
    }
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
export { fetchAccessRequests, createAccessRequest, updateAccessRequest }
