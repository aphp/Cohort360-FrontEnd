import api from '../apiFhir'
import { CONTEXT } from '../../constants'
import { FHIR_API_Response } from 'types'
import { IGroup, IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

export const fetchDeidentified = async (
  practitionerId?: string
): Promise<{ deidentification: boolean; nominativeGroupsIds?: string[] }> => {
  if (CONTEXT === 'fakedata') {
    return { deidentification: false, nominativeGroupsIds: [] }
  }
  if (CONTEXT === 'arkhn') {
    return { deidentification: false }
  }
  if (CONTEXT === 'aphp') {
    const rolesResp = await api.get<FHIR_API_Response<IPractitionerRole>>(
      `/PractitionerRole?practitioner=${practitionerId}&_elements=extension,organization`
    )

    const { data } = rolesResp

    let deidentification = true
    const nominativePerimeters = []
    let nominativeGroupsIds: any[] | undefined = []

    if (!data || data.resourceType === 'OperationOutcome' || !data.meta || !data.meta.extension) {
      return { deidentification: deidentification }
    }

    const highestPerimeters = data.meta.extension.find(
      (extension) => extension.url === 'Practitioner Organization List'
    )

    const rolesList = highestPerimeters?.extension?.[0].extension

    if (rolesList && rolesList.length > 0) {
      for (const perimeterRole of rolesList) {
        if (perimeterRole.valueString && perimeterRole.valueString === 'READ_DATA_NOMINATIVE') {
          deidentification = false
          nominativePerimeters.push(perimeterRole.url)
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
  return { deidentification: true }
}
