import api from '../apiFhir'
import { CONTEXT, API_RESOURCE_TAG } from '../../constants'
import {
  IPractitionerRole,
  IOrganization,
  IHealthcareService,
  IPatient,
  IExtension
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response, ScopeTreeRow } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'

import { MeState } from 'state/me'

import fakeScopeRows from 'data/fakeData/scopeRows'

const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }

const getServicePatientsCount = async (
  service: IHealthcareService
): Promise<{ total: number; serviceId: string | undefined }> => {
  const patientsResp = await api.get<FHIR_API_Response<IPatient>>(
    `Patient?_has:Encounter:subject:service-provider=${service.id}&_summary=count${API_RESOURCE_TAG}`
  )
  return {
    total: patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total ?? 0 : 0,
    serviceId: service.id
  }
}

const getOrganizationServices = async (
  orga: IOrganization
): Promise<{ orgaId: string | undefined; services: IHealthcareService[] }> => {
  const orgaId = orga.id
  if (!orgaId) {
    return { services: [], orgaId }
  }
  const orgaServicesResp = await api.get<FHIR_API_Response<IHealthcareService>>(
    `HealthcareService?organization:Organization=${orgaId}${API_RESOURCE_TAG}`
  )

  return { services: getApiResponseResources(orgaServicesResp) ?? [], orgaId }
}

export const getPerimeters = async (practitionerId: string) => {
  if (CONTEXT === 'aphp') {
    const practitionerRole = await api.get<FHIR_API_Response<IPractitionerRole>>(
      `/PractitionerRole?practitioner=${practitionerId}&_elements=organization,extension`
    )
    if (!practitionerRole) return undefined

    const { data } = practitionerRole
    if (!data || data?.resourceType === 'OperationOutcome') return undefined

    const practitionerRoleData = getApiResponseResources(practitionerRole)

    const practitionerRoleHighPerimeter = data.meta?.extension?.length
      ? data.meta?.extension?.find((extension) => extension.url === 'Practitioner Organization List')
      : { extension: [] }
    const practitionerRoleList = data.meta?.extension?.length
      ? data.meta?.extension?.find((extension) => extension.url === 'Role List')
      : { extension: [] }

    const perimeterList: any[] | undefined = practitionerRoleHighPerimeter?.extension?.length
      ? practitionerRoleHighPerimeter?.extension[0].extension?.length
        ? practitionerRoleHighPerimeter?.extension[0].extension
        : []
      : []

    const roleList: any[] | undefined =
      practitionerRoleList && practitionerRoleList.extension && practitionerRoleList.extension?.length
        ? practitionerRoleList.extension.filter(
            (practitionerRoleItem: any) =>
              practitionerRoleItem.extension.some(
                (extension: any) => extension.url === 'RIGHT_READ_PATIENT_NOMINATIVE' && extension.valueBoolean === true
              ) ||
              practitionerRoleItem.extension.some(
                (extension: any) =>
                  extension.url === 'RIGHT_READ_PATIENT_PSEUDO_ANONYMISED' && extension.valueBoolean === true
              )
          )
        : []
    const perimetersIds = perimeterList.map(({ url }) => url)
    if (!perimetersIds || perimetersIds?.length === 0) return undefined

    const organisationResult = await api.get<any>(`/Organization?_id=${perimetersIds}&_elements=name,extension,alias`)
    const organisationData: any[] = organisationResult.data
      ? organisationResult.data.entry && organisationResult.data.entry.length > 0
        ? organisationResult.data.entry
            .map((entry: any) => entry.resource)
            .map((organization: any) => {
              const organizationId = organization.id
              if (!organizationId) return organization
              const foundItem = practitionerRoleData?.find(
                (practitionerRole) =>
                  practitionerRole?.organization?.reference?.replace(/^Organization\//, '') === organizationId
              )

              return {
                ...organization,
                extension: [...((foundItem && foundItem.extension) || []), ...(organization.extension ?? [])]
              }
            })
        : null
      : null

    return organisationData.filter((organisation: any) =>
      organisation.extension.some(
        (extension: any) =>
          extension.url === 'access level' && roleList.some((role) => role.url === extension.valueString)
      )
    )
  }
}

const getScopeName = (perimeter: any) => {
  const perimeterID = perimeter ? perimeter.alias?.[0] : false
  if (!perimeterID) {
    return perimeter ? perimeter.name : ''
  }
  return `${perimeterID} - ${perimeter.name}`
}

const getQuantity = (extension?: IExtension[]) => {
  const accessExtension = extension?.find((extension) => extension.url === 'cohort-size')
  if (!extension || !accessExtension) {
    return 0
  }
  return accessExtension.valueInteger || 0
}

const getAccessName = (extension?: IExtension[]) => {
  const accessExtension = extension?.find((extension) => extension.url === 'High Level Organisation Role')
  if (!extension || !accessExtension) {
    return ''
  }
  const access = accessExtension?.valueString

  switch (access) {
    case 'READ_DATA_NOMINATIVE':
      return 'Nominatif'
    case 'READ_DATA_PSEUDOANONYMISED':
      return 'Pseudonymisé'
    case 'ADMIN_USERS':
      return 'Nominatif'
    default:
      return ''
  }
}

export const getScopePerimeters = async (practitioner: MeState): Promise<ScopeTreeRow[]> => {
  const practitionerId = practitioner?.id ?? ''
  if (CONTEXT === 'fakedata') {
    const scopeRows = fakeScopeRows as ScopeTreeRow[]

    return scopeRows
  } else if (CONTEXT === 'aphp') {
    const perimetersResults = (await getPerimeters(practitionerId)) ?? []

    let scopeRows: ScopeTreeRow[] = []

    for (const perimetersResult of perimetersResults) {
      const scopeRow: ScopeTreeRow = perimetersResult as ScopeTreeRow

      scopeRow.name = getScopeName(perimetersResult)
      scopeRow.quantity = getQuantity(perimetersResult.extension)
      scopeRow.access = getAccessName(perimetersResult.extension)
      scopeRow.subItems = await getScopeSubItems(perimetersResult as ScopeTreeRow)
      scopeRows = [...scopeRows, scopeRow]
    }

    // Sort by quantity
    scopeRows = scopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
      if (a.quantity > b.quantity) {
        return 1
      } else if (a.quantity < b.quantity) {
        return -1
      }
      return 0
    })
    // Sort by name
    scopeRows = scopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
      if (b.quantity === 0) return -1
      if (a.name > b.name) {
        return 1
      } else if (a.name < b.name) {
        return -1
      }
      return 0
    })

    return scopeRows
  } else if (CONTEXT === 'arkhn') {
    const scopeRows: ScopeTreeRow[] = []
    const [healthcareServicesWOOrgaResp, organizationsResp] = await Promise.all([
      api.get<FHIR_API_Response<IHealthcareService>>(`HealthcareService?organization:missing=true${API_RESOURCE_TAG}`),
      api.get<FHIR_API_Response<IOrganization>>(`/Organization?${API_RESOURCE_TAG}`)
    ])

    const healthcareServicesWOOrga = getApiResponseResources(healthcareServicesWOOrgaResp)
    const organizations = getApiResponseResources(organizationsResp)

    if (organizations) {
      const servicesPerOrga = await Promise.all(organizations.map((orga) => getOrganizationServices(orga)))

      const flattenServices = servicesPerOrga.reduce(
        (
          acc: {
            orgaId: string | undefined
            serviceId: string | undefined
            service: IHealthcareService
          }[],
          serviceObj
        ) => {
          return [
            ...acc,
            ...serviceObj.services.map((service) => ({
              orgaId: serviceObj.orgaId,
              serviceId: service.id,
              service
            }))
          ]
        },
        []
      )
      const patientsCountPerServices = await Promise.all(
        flattenServices.map((serviceObj) => getServicePatientsCount(serviceObj.service))
      )

      flattenServices.forEach((serviceObj, serviceIndex) => {
        scopeRows.push({
          id: serviceObj.serviceId ?? '',
          name: serviceObj.service.name ?? '',
          quantity: patientsCountPerServices[serviceIndex].total,
          parentId: serviceObj.orgaId,
          subItems: []
        })
      })

      organizations.forEach((orga) => {
        const orgaTotalPatients = scopeRows.reduce(
          (acc, row) => (row.parentId === orga.id ? acc + row.quantity : acc),
          0
        )
        scopeRows.push({
          resourceType: orga.resourceType,
          id: orga.id ?? '',
          name: orga.name ?? '',
          quantity: orgaTotalPatients,
          subItems: []
        })
      })
    }

    if (healthcareServicesWOOrga) {
      //Add healthcare services to scopeRows
      const servicesPatientsCount = await Promise.all(
        healthcareServicesWOOrga.map((service) => getServicePatientsCount(service))
      )
      healthcareServicesWOOrga.forEach((service) => {
        const serviceTotalPatient = servicesPatientsCount.find((obj) => obj.serviceId === service.id)
        scopeRows.push({
          resourceType: service.resourceType,
          id: service.id ?? '',
          name: service.name ?? '',
          quantity: serviceTotalPatient ? serviceTotalPatient.total : 0,
          subItems: []
        })
      })
    }
    return scopeRows
  }
  return []
}

export const getScopeSubItems = async (
  perimeter: ScopeTreeRow | null,
  getSubItem?: boolean
): Promise<ScopeTreeRow[]> => {
  if (!perimeter) return []
  const perimeterGroupId = perimeter.id
  const organization = await api.get<FHIR_API_Response<IOrganization>>(
    `/Organization?partof=${perimeterGroupId}&_elements=name,extension,alias`
  )
  if (!organization) return []

  const organizationData = getApiResponseResources(organization) || []
  if (organizationData.length === 0) return []

  let subScopeRows: ScopeTreeRow[] = []

  for (const perimetersResult of organizationData) {
    const scopeRow: ScopeTreeRow = perimetersResult as ScopeTreeRow

    scopeRow.name = getScopeName(perimetersResult)
    scopeRow.quantity = getQuantity(perimetersResult.extension)
    scopeRow.subItems = getSubItem === true ? await getScopeSubItems(perimetersResult as ScopeTreeRow) : [loadingItem]
    scopeRow.access = perimeter.access
    subScopeRows = [...subScopeRows, scopeRow]
  }

  // Sort by name
  subScopeRows = subScopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (a.quantity > b.quantity) {
      return 1
    } else if (a.quantity < b.quantity) {
      return -1
    }
    return 0
  })
  subScopeRows = subScopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (b.quantity === 0) return -1
    if (a.name > b.name) {
      return 1
    } else if (a.name < b.name) {
      return -1
    }
    return 0
  })

  return subScopeRows
}
