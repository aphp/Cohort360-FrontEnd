import api from './api'
import { CONTEXT } from '../constants'
import { IExtension, IGroup, IOrganization, IPatient, IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response, ScopeTreeRow } from '../types'
import { getApiResponseResources } from 'utils/apiHelpers'

import fakeScopeRows from '../data/fakeData/scopeRows'

const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0 }

const getServicePatientsCount = async (
  organization: IOrganization
): Promise<{ total: number; service: IOrganization }> => {
  const patientsResp = await api.get<FHIR_API_Response<IPatient>>(
    `Patient?_has:Encounter:subject:service-provider=${organization.id}&_summary=count`
  )
  return {
    total: patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total ?? 0 : 0,
    service: organization
  }
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
    const perimetersIds: any[] | undefined = practitionerRoleData?.map(({ organization }) =>
      organization?.reference?.replace(/^Organization\//, '')
    )
    if (!perimetersIds || perimetersIds?.length === 0) return undefined

    const perimeters = await api.get<FHIR_API_Response<IGroup>>(
      `/Group?managing-entity=${perimetersIds}&_elements=name,quantity,managingEntity`
    )

    const perimetersResult = getApiResponseResources(perimeters)

    return perimetersResult && perimetersResult.length > 0
      ? perimetersResult.map((perimeter) => {
          const organizationId = perimeter?.managingEntity?.display || null
          if (!organizationId) return perimeter
          const foundItem = practitionerRoleData?.find(
            (practitionerRole) => practitionerRole?.organization?.reference === organizationId
          )
          return {
            ...perimeter,
            extension: foundItem ? foundItem.extension : undefined
          }
        })
      : []
  }
}

const getAccessName = (extension?: IExtension[]) => {
  if (!extension || !extension.find((extension) => extension.url === 'access level')) {
    return ''
  }

  const accessExtension = extension.find((extension) => extension.url === 'access level')

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

export const getScopePerimeters = async (practitionerId: string): Promise<ScopeTreeRow[]> => {
  if (CONTEXT === 'fakedata') {
    const scopeRows = fakeScopeRows as ScopeTreeRow[]

    return scopeRows
  }
  if (CONTEXT === 'aphp') {
    const perimetersResults = await getPerimeters(practitionerId)

    let scopeRows: ScopeTreeRow[] = perimetersResults
      ? perimetersResults?.map<ScopeTreeRow>((perimeterResult) => ({
          ...perimeterResult,
          id: perimeterResult.id ?? '0',
          name: perimeterResult.name?.replace(/^Patients passés par: /, '') ?? '',
          quantity: perimeterResult.quantity ?? 0,
          access: getAccessName(perimeterResult.extension),
          subItems: [loadingItem]
        }))
      : []

    // Sort by name
    scopeRows = scopeRows.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
      if (a.quantity > b.quantity) {
        return 1
      } else if (a.quantity < b.quantity) {
        return -1
      }
      return 0
    })
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
  }

  if (CONTEXT === 'arkhn') {
    const organizationsResp = await api.get<FHIR_API_Response<IOrganization>>(`/Organization?type=dept`)
    const organizations = getApiResponseResources(organizationsResp)
    if (!organizations) return []

    const patientsCountPerServices = await Promise.all(
      organizations.map((organization) => getServicePatientsCount(organization))
    )

    return patientsCountPerServices.map((result) => ({
      resourceType: result.service.resourceType,
      id: result.service.id || '',
      name: result.service.name || '',
      quantity: result.total,
      subItems: []
    }))
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

  let _subItemsData = subItemsData
    ? subItemsData?.map<ScopeTreeRow>((subItemData) => ({
        ...subItemData,
        id: subItemData.id ?? '0',
        name: subItemData.name?.replace(/^Patients passés par: /, '') ?? '',
        quantity: subItemData.quantity ?? 0,
        subItems: [loadingItem]
      }))
    : []

  // Sort by name
  _subItemsData = _subItemsData.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (a.quantity > b.quantity) {
      return 1
    } else if (a.quantity < b.quantity) {
      return -1
    }
    return 0
  })
  _subItemsData = _subItemsData.sort((a: ScopeTreeRow, b: ScopeTreeRow) => {
    if (b.quantity === 0) return -1
    if (a.name > b.name) {
      return 1
    } else if (a.name < b.name) {
      return -1
    }
    return 0
  })
  return _subItemsData
}
