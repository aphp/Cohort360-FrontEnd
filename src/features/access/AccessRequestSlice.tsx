import { IPractitionerRole, IPractitioner, IOrganization } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

import {
  PERMISSION_STATUS_STRUCTURE_DEF_URL,
  PRACTITIONER_CONSENT_PROFILE_URL,
  CONSENT_CATEGORIES_CODE_URL
} from '../../constants'
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

    if (!practitionerId) throw new Error('Practitioner not logged')

    // Create as many PractitionerRole as "out of scope" organizations
    const accessResources: IPractitionerRole[] = outOfPerimeterOrgaIds.map((orgaId) => ({
      resourceType: 'PractitionerRole',
      id: uuid(),
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: [PRACTITIONER_CONSENT_PROFILE_URL]
      },
      practitioner: {
        type: 'Practitioner',
        reference: `Practitioner/${practitionerId}`
      },
      organization: {
        type: 'Organization',
        reference: `Organization/${orgaId}`
      },
      extension: [
        {
          url: PERMISSION_STATUS_STRUCTURE_DEF_URL,
          valueCode: `proposed`
        }
      ],
      code: [
        {
          coding: [
            {
              system: CONSENT_CATEGORIES_CODE_URL,
              code: 'research'
            }
          ]
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
