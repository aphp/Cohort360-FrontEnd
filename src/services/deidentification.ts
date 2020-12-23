import api from './api'
import { CONTEXT } from '../constants'
import { FHIR_API_Response } from 'types'
import { IGroup, IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

const fetchDeidentified = async (
  practitionerId?: string
): Promise<{ deidentification: boolean; nominativeGroupsIds?: string[] } | undefined> => {
  if (CONTEXT === 'arkhn') {
    return { deidentification: false }
  }
  if (CONTEXT === 'aphp') {
    const rolesResp = await api.get<FHIR_API_Response<IPractitionerRole>>(
      `/PractitionerRole?practitioner=${practitionerId}&_elements=extension,organization`
    )

    const roles = getApiResponseResources(rolesResp)

    let deidentification = true
    const nominativePerimeters = []
    let nominativeGroupsIds: any[] | undefined = []

    if (roles) {
      for (const role of roles) {
        if (role.extension?.[0].valueString === 'READ_DATA_NOMINATIVE') {
          deidentification = false
          nominativePerimeters.push(role.organization?.reference?.substring(13))
        }
      }
    }

    if (nominativePerimeters.length > 0) {
      const nominativeGroupsResp = await api.get<FHIR_API_Response<IGroup>>(
        `/Group?managing-entity=${nominativePerimeters}&_elements=name,managingEntity`
      )

      const nominativeGroups = getApiResponseResources(nominativeGroupsResp)

      nominativeGroupsIds = nominativeGroups?.map((group) => group.id)
    }

    return { deidentification, nominativeGroupsIds }
  }
}

export { fetchDeidentified }
