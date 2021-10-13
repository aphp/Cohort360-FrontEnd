import { CohortData, ScopeTreeRow } from 'types'
import { IOrganization, IExtension } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  getGenderRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { MeState } from 'state/me'

import { fetchGroup, fetchPatient, fetchEncounter, fetchOrganization, fetchPractitionerRole } from './callApi'

const loadingItem: ScopeTreeRow = { id: 'loading', name: 'loading', quantity: 0, subItems: [] }

export interface IServicesPerimeters {
  fetchPerimetersInfos: (perimetersId: string) => Promise<CohortData | undefined>
  fetchPerimeterInfoForRequeteur: (perimeterId: string) => Promise<ScopeTreeRow | undefined>
  getPerimeters: (practitionerId: string) => Promise<IOrganization[]>
  getScopePerimeters: (practitioner: MeState) => Promise<ScopeTreeRow[]>
  getScopeSubItems: (perimeter: ScopeTreeRow | null, getSubItem?: boolean) => Promise<ScopeTreeRow[]>
  fetchDeidentified: (practitionerId: string) => Promise<{ deidentification: boolean; nominativeGroupsIds: any[] }>
}

const servicesPerimeters: IServicesPerimeters = {
  fetchPerimetersInfos: async (perimetersId) => {
    const [perimetersResp, patientsResp, encountersResp] = await Promise.all([
      fetchGroup({
        _id: perimetersId
      }),
      fetchPatient({
        pivotFacet: ['age_gender', 'deceased_gender'],
        _list: perimetersId.split(','),
        size: 20,
        _sort: 'given',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        _list: perimetersId.split(','),
        size: 0,
        type: 'VISIT'
      })
    ])

    const cohort = getApiResponseResources(perimetersResp)

    const totalPatients = patientsResp?.data?.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const ageFacet = patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')
    const deceasedFacet = patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')
    const visitFacet = encountersResp.data.meta?.extension?.filter(
      (facet: any) => facet.url === 'facet-visit-year-month-gender-facet'
    )
    const classFacet = encountersResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-class-simple')

    const agePyramidData =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(ageFacet && ageFacet[0] && ageFacet[0].extension)
        : undefined
    const genderRepartitionMap =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(deceasedFacet && deceasedFacet[0] && deceasedFacet[0].extension)
        : undefined
    const monthlyVisitData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(visitFacet && visitFacet[0] && visitFacet[0].extension)
        : undefined
    const visitTypeRepartitionData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(classFacet && classFacet[0] && classFacet[0].extension)
        : undefined

    return {
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  },

  fetchPerimeterInfoForRequeteur: async (perimeterId) => {
    if (!perimeterId) return undefined

    // Get perimeter info with `perimeterId`
    const groupResults = await fetchGroup({
      _id: perimeterId
    })

    // Construct an `orgazationId`
    let organiszationId =
      groupResults && groupResults.data && groupResults.data.resourceType === 'Bundle'
        ? groupResults.data.entry && groupResults.data.entry.length > 0
          ? groupResults.data.entry[0].resource?.managingEntity?.display ?? ''
          : ''
        : ''
    organiszationId = organiszationId.replace('Organization/', '')

    // Get perimeter info with `organiszationId`
    const organizationResult = await fetchOrganization({
      _id: organiszationId,
      _elements: ['name', 'extension']
    })

    // Convert result in ScopeTreeRow
    const organization =
      organizationResult && organizationResult.data && organizationResult.data.resourceType === 'Bundle'
        ? organizationResult.data.entry && organizationResult.data.entry.length > 0
          ? organizationResult.data.entry[0].resource
          : undefined
        : undefined

    const scopeRows: ScopeTreeRow | undefined = organization
      ? {
          ...organization,
          id: organization.id ?? '',
          name: organization.name ?? '',
          quantity:
            organization.extension && organization.extension.length > 0
              ? organization.extension.find((extension: any) => extension.url === 'cohort-size')?.valueInteger ?? 0
              : 0,
          subItems: []
        }
      : undefined
    return scopeRows
  },

  getPerimeters: async (practitionerId) => {
    const practitionerRole = await fetchPractitionerRole({
      practitioner: practitionerId,
      _elements: ['organization', 'extension']
    })
    if (!practitionerRole) return []

    const { data } = practitionerRole
    if (!data || data?.resourceType === 'OperationOutcome') return []

    const practitionerRoleData = getApiResponseResources(practitionerRole)

    const practitionerRoleHighPerimeter = data.meta?.extension?.length
      ? data.meta?.extension?.find((extension) => extension.url === 'Practitioner Organization List')
      : { extension: [] }

    const rolesList = practitionerRoleHighPerimeter?.extension?.length
      ? practitionerRoleHighPerimeter?.extension[0].extension?.length
        ? practitionerRoleHighPerimeter?.extension[0].extension
        : []
      : []

    const perimetersIds = rolesList.map(({ url }) => url)
    if (!perimetersIds || perimetersIds?.length === 0) return []

    const organisationResult = await fetchOrganization({
      _id: perimetersIds.join(','),
      _elements: ['name', 'extension', 'alias']
    })

    const organisationData = getApiResponseResources(organisationResult)

    return organisationData && organisationData.length > 0
      ? organisationData.map((organization) => {
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
      : []
  },

  getScopePerimeters: async (practitioner) => {
    const practitionerId = practitioner?.id ?? ''

    const perimetersResults = (await servicesPerimeters.getPerimeters(practitionerId)) ?? []

    let scopeRows: ScopeTreeRow[] = []

    for (const perimetersResult of perimetersResults) {
      const scopeRow: ScopeTreeRow = perimetersResult as ScopeTreeRow

      scopeRow.name = getScopeName(perimetersResult)
      scopeRow.quantity = getQuantity(perimetersResult.extension)
      scopeRow.access = getAccessName(perimetersResult.extension)
      scopeRow.subItems = await servicesPerimeters.getScopeSubItems(perimetersResult as ScopeTreeRow)
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
  },

  getScopeSubItems: async (perimeter: ScopeTreeRow | null, getSubItem?: boolean) => {
    if (!perimeter) return []
    const perimeterGroupId = perimeter.id
    const organization = await fetchOrganization({
      partof: perimeterGroupId,
      _elements: ['name', 'extension', 'alias']
    })
    if (!organization) return []

    const organizationData = getApiResponseResources(organization) || []
    if (organizationData.length === 0) return []

    let subScopeRows: ScopeTreeRow[] = []

    for (const perimetersResult of organizationData) {
      const scopeRow: ScopeTreeRow = perimetersResult as ScopeTreeRow

      scopeRow.name = getScopeName(perimetersResult)
      scopeRow.quantity = getQuantity(perimetersResult.extension)
      scopeRow.access = getAccessName(perimetersResult.extension)
      scopeRow.subItems =
        getSubItem === true
          ? await servicesPerimeters.getScopeSubItems(perimetersResult as ScopeTreeRow)
          : [loadingItem]
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
  },

  fetchDeidentified: async (practitionerId) => {
    const rolesResp = await fetchPractitionerRole({
      practitioner: practitionerId,
      _elements: ['extension', 'organization']
    })
    const { data } = rolesResp

    let deidentification = true
    const nominativePerimeters = []
    let nominativeGroupsIds: string[] = []

    if (!data || data.resourceType === 'OperationOutcome' || !data.meta || !data.meta.extension) {
      return { deidentification, nominativeGroupsIds: [] }
    }

    const highestPerimeters = data.meta.extension.find(
      (extension: { url?: string; valueString?: string }) => extension.url === 'Practitioner Organization List'
    )

    const rolesList = highestPerimeters?.extension?.[0].extension

    if (rolesList && rolesList.length > 0) {
      for (const perimeterRole of rolesList) {
        if (perimeterRole.valueString && perimeterRole.valueString === 'READ_DATA_NOMINATIVE') {
          deidentification = false
          nominativePerimeters.push(perimeterRole.url ?? '')
        }
      }
    }

    if (nominativePerimeters.length > 0) {
      const nominativeGroupsResp = await fetchGroup({
        'managing-entity': nominativePerimeters,
        _elements: ['name', 'managingEntity']
      })

      const nominativeGroups = getApiResponseResources(nominativeGroupsResp)

      nominativeGroupsIds = nominativeGroups ? nominativeGroups.map((group) => group.id ?? '') : []
    }

    return { deidentification, nominativeGroupsIds: nominativeGroupsIds ?? [] }
  }
}

export default servicesPerimeters

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
