import api from './api'
import { CONTEXT } from '../constants'
import { FHIR_API_Response } from 'types'
import { IExtension, IGroup, IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from 'utils/apiHelpers'

const getNominativeRoles = (practitionerRolesData: any) => {
  if (
    !practitionerRolesData ||
    practitionerRolesData.resourceType === 'OperationOutcome' ||
    !practitionerRolesData.meta ||
    !practitionerRolesData.meta.extension
  ) {
    return []
  }

  const roles = practitionerRolesData.meta.extension
  const nominativeRolesNames: string[] = []

  roles.forEach((role: IExtension) => {
    if (role.extension && role.extension[0].url === 'role details') {
      if (!role.extension[0].extension) return

      const details = role.extension[0].extension

      const nominativeRightsInfo = details.find((roleDetails) => roleDetails.url === 'RIGHT_READ_DATA_NOMINATIVE')

      if (nominativeRightsInfo && nominativeRightsInfo.valueBoolean === true && role.url) {
        nominativeRolesNames.push(role.url)
      }
    }
  })

  return nominativeRolesNames
}

const fetchDeidentified = async (
  practitionerId?: string
): Promise<{ deidentification: boolean; nominativeGroupsIds?: string[] } | undefined> => {
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

    const nominativeRolesNames = getNominativeRoles(rolesResp.data)

    const roles = getApiResponseResources(rolesResp)

    let deidentification = true
    const nominativePerimeters = []
    let nominativeGroupsIds: any[] | undefined = []

    if (roles) {
      for (const role of roles) {
        if (
          role.extension &&
          role.extension[0] &&
          role.extension[0].valueString &&
          nominativeRolesNames.includes(role.extension?.[0].valueString)
        ) {
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
