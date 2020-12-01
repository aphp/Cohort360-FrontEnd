import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import {
  IGroup,
  IPractitionerRole,
  IOrganization,
  IHealthcareService,
  IPatient
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response, ScopeTreeRow } from '../types'
import { getApiResponseResources } from 'utils/apiHelpers'

const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0 }

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
      `/PractitionerRole?practitioner=${practitionerId}&_elements=organization`
    )
    if (!practitionerRole) return undefined

    const { data } = practitionerRole
    if (!data || data?.resourceType === 'OperationOutcome') return undefined

    const practitionerRoleData = getApiResponseResources(practitionerRole)
    const perimetersIds: any[] | undefined = practitionerRoleData?.map(({ organization }) =>
      organization?.reference?.replace(/^Organization\//, '')
    )
    if (!perimetersIds || perimetersIds?.length === 0) return undefined

    const perimeters = await api.get<FHIR_API_Response<IGroup>>(
      `/Group?managing-entity=${perimetersIds}&_elements=name,quantity,managingEntity`
    )

    const perimetersResult = getApiResponseResources(perimeters)
    return perimetersResult
  }
}
export const getScopePerimeters = async (practitionerId: string): Promise<ScopeTreeRow[]> => {
  if (CONTEXT === 'aphp') {
    const perimetersResults = await getPerimeters(practitionerId)
    const scopeRows: ScopeTreeRow[] = perimetersResults
      ? perimetersResults?.map<ScopeTreeRow>((perimeterResult) => ({
          ...perimeterResult,
          id: perimeterResult.id ?? '0',
          name: perimeterResult.name?.replace(/^Patients passés par: /, '') ?? '',
          quantity: perimeterResult.quantity ?? 0,
          subItems: [loadingItem]
        }))
      : []
    return scopeRows
  }

  if (CONTEXT === 'arkhn') {
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

export const getScopeSubItems = async (perimeter: ScopeTreeRow | null): Promise<ScopeTreeRow[] | undefined> => {
  if (!perimeter) return []
  const perimeterGroupId = perimeter?.managingEntity?.display?.replace(/^Organization\//, '') || 0
  const organization = await api.get<FHIR_API_Response<IOrganization>>(
    `/Organization?partof=${perimeterGroupId}&_elements=id`
  )
  if (!organization) return []

  const organizationData = getApiResponseResources(organization)
  let organizationIds = organizationData?.map((org) => org.id ?? '').filter((id) => id !== '')
  organizationIds = organizationIds?.filter((id) => id !== '')
  if (organizationIds && organizationIds.length === 0) return []

  const subItemsRequest = await api.get<FHIR_API_Response<IGroup>>(
    `/Group?managing-entity=${organizationIds}&_elements=name,quantity,managingEntity`
  )
  if (!subItemsRequest) return []

  let subItemsData = getApiResponseResources(subItemsRequest)
  subItemsData = subItemsData?.filter(
    ({ managingEntity }) => managingEntity?.display?.replace(/^Organization\//, '') !== perimeterGroupId
  )

  const _subItemsData = subItemsData
    ? subItemsData?.map<ScopeTreeRow>((subItemData) => ({
        ...subItemData,
        id: subItemData.id ?? '0',
        name: subItemData.name?.replace(/^Patients passés par: /, '') ?? '',
        quantity: subItemData.quantity ?? 0,
        subItems: [loadingItem]
      }))
    : []
  return _subItemsData
}
