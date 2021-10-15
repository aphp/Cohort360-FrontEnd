import api from '../apiFhir'
import { CONTEXT, API_RESOURCE_TAG } from '../../constants'
import { FHIR_API_Response, CohortData, ScopeTreeRow } from 'types'
import { IOrganization, IHealthcareService, IEncounter, IPatient, IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  getGenderRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getEncounterRepartitionMap,
  getVisitRepartitionMapAphp,
  getAgeRepartitionMap,
  getGenderRepartitionMap,
  getVisitRepartitionMap
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import fakeGroup from 'data/fakeData/group'
import fakeFacetDeceased from 'data/fakeData/facet-deceased'
import fakeFacetAgeMonth from 'data/fakeData/facet-age-month'
import fakeFacetClassSimple from 'data/fakeData/facet-class-simple'
import fakeFacetStartDateFacet from 'data/fakeData/facet-start-date-facet'
import fakePatients from 'data/fakeData/patients'

export const getServices = async (id: string) => {
  const [respOrganizations, respHealthcareServices] = await Promise.all([
    api.get<FHIR_API_Response<IOrganization>>(`/Organization?_id=${id}${API_RESOURCE_TAG}`),
    api.get<FHIR_API_Response<IHealthcareService>>(`/HealthcareService?_id=${id}${API_RESOURCE_TAG}`)
  ])

  const organizations = getApiResponseResources(respOrganizations)
  const healthcareServices = getApiResponseResources(respHealthcareServices)
  if (!organizations || !healthcareServices) {
    return []
  }
  let services: IHealthcareService[] = [...healthcareServices]

  for (const orga of organizations) {
    if (orga.id) {
      const impliedServiceResp = await api.get<FHIR_API_Response<IHealthcareService>>(
        `/HealthcareService?organization=${orga.id}${API_RESOURCE_TAG}`
      )
      const impliedServices = getApiResponseResources(impliedServiceResp)
      if (impliedServices) {
        services = [...services, ...impliedServices]
      }
    }
  }
  return services
}

const getPatientsAndEncountersFromServiceId = async (serviceId: string) => {
  const [respEncounters, respPatients] = await Promise.all([
    api.get<FHIR_API_Response<IEncounter>>(`/Encounter?service-provider=${serviceId}&_count=10000`),
    api.get<FHIR_API_Response<IPatient>>(`/Patient?_has:Encounter:subject:service-provider=${serviceId}&_count=10000`)
  ])
  const encounters = getApiResponseResources(respEncounters)
  const patients = getApiResponseResources(respPatients)
  if (!encounters || !patients) {
    return
  }

  return {
    encounters,
    patients
  }
}

export const fetchPerimetersInfos = async (perimetersId: string): Promise<CohortData | undefined> => {
  if (CONTEXT === 'fakedata') {
    const totalPatients = 3

    const cohort = fakeGroup as IGroup

    const originalPatients = fakePatients as IPatient[]

    const agePyramidData = getAgeRepartitionMapAphp(fakeFacetAgeMonth)

    const genderRepartitionMap = getGenderRepartitionMapAphp(fakeFacetDeceased)

    const monthlyVisitData = getVisitRepartitionMapAphp(fakeFacetStartDateFacet)

    const visitTypeRepartitionData = getEncounterRepartitionMapAphp(fakeFacetClassSimple)
    return {
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  }
  if (CONTEXT === 'aphp') {
    const [perimetersResp, patientsResp, encountersResp] = await Promise.all([
      api.get<FHIR_API_Response<IGroup>>(`/Group?_id=${perimetersId}`),
      api.get<FHIR_API_Response<IPatient>>(
        `/Patient?pivotFacet=age_gender,deceased_gender&_list=${perimetersId}&size=20&_sort=given&_elements=gender,name,birthDate,deceased,identifier,extension`
      ),
      api.get<FHIR_API_Response<IEncounter>>(
        `/Encounter?facet=class,visit-year-month-gender-facet&_list=${perimetersId}&size=0&type=VISIT`
      )
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
  } else if (CONTEXT === 'arkhn') {
    const services = (await getServices(perimetersId)).filter((service) => undefined !== service.id)
    const serviceIds = services.map((service) => service.id)

    //FIX: There can be several patients from this request (if a patient is in several services)
    const patientsAndEncountersFromServices = await getPatientsAndEncountersFromServiceId(serviceIds.join(','))
    if (patientsAndEncountersFromServices) {
      const { patients, encounters } = patientsAndEncountersFromServices

      return {
        originalPatients: patients,
        totalPatients: patients.length,
        encounters: encounters,
        agePyramidData: getAgeRepartitionMap(patients),
        genderRepartitionMap: getGenderRepartitionMap(patients),
        monthlyVisitData: getVisitRepartitionMap(patients, encounters),
        visitTypeRepartitionData: getEncounterRepartitionMap(encounters)
      }
    }
  }
}

const getScopeName = (perimeter: any) => {
  const perimeterID = perimeter ? perimeter.alias?.[0] : false
  if (!perimeterID) {
    return perimeter ? perimeter.name : ''
  }
  return `${perimeterID} - ${perimeter.name}`
}

export const fetchPerimeterInfoForRequeteur = async (perimeterId: string): Promise<ScopeTreeRow | null> => {
  if (!perimeterId) return null

  // Get perimeter info with `perimeterId`
  const groupResults = await api.get<any>(`/Group?_id=${perimeterId}`)

  // Construct an `orgazationId`
  let organiszationId =
    groupResults && groupResults.data
      ? groupResults.data.entry && groupResults.data.entry.length > 0
        ? groupResults.data.entry[0].resource?.managingEntity?.display
        : null
      : null
  organiszationId = organiszationId ? organiszationId.replace('Organization/', '') : ''
  if (!organiszationId) return null

  // Get perimeter info with `organiszationId`
  const organizationResult = await api.get<any>(`/Organization?_id=${organiszationId}&_elements=name,extension,alias`)

  // Convert result in ScopeTreeRow
  const organization =
    organizationResult && organizationResult.data
      ? organizationResult.data.entry && organizationResult.data.entry.length > 0
        ? organizationResult.data.entry[0].resource
        : null
      : null
  const scopeRows: ScopeTreeRow | null = organization
    ? {
        ...organization,
        id: organization.id,
        name: getScopeName(organization),
        quantity:
          organization.extension && organization.extension.length > 0
            ? organization.extension.find((extension: any) => extension.url)
            : 0,
        subItems: []
      }
    : null
  return scopeRows
}
