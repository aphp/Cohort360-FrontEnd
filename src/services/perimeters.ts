import api from './api'
import { getLastEncounter } from './myPatients'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
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

import fakeGroup from '../data/fakeData/group'
import fakeFacetDeceased from '../data/fakeData/facet-deceased'
import fakeFacetAgeMonth from '../data/fakeData/facet-age-month'
import fakeFacetClassSimple from '../data/fakeData/facet-class-simple'
import fakeFacetStartDateFacet from '../data/fakeData/facet-start-date-facet'
import fakePatients from '../data/fakeData/patients'

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
        `/Encounter?pivotFacet=start-date_start-date-month_gender&facet=class&_list=${perimetersId}&size=0&type=VISIT`
      )
    ])

    const cohort = getApiResponseResources(perimetersResp)

    const totalPatients = patientsResp?.data?.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = await getLastEncounter(getApiResponseResources(patientsResp))

    const agePyramidData =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp?.data?.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')?.[0].extension
          )
        : undefined

    const monthlyVisitData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(
            encountersResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-start-date-facet')?.[0]
              .extension
          )
        : undefined

    const visitTypeRepartitionData =
      encountersResp?.data?.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            encountersResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-class-simple')?.[0]
              .extension
          )
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

export const fetchPerimeterInfoForRequeteur = async (perimetersId: string): Promise<ScopeTreeRow[]> => {
  if (!perimetersId) return []

  const groupsResults = await api.get<FHIR_API_Response<IGroup>>(`/Group?_id=${perimetersId}`)
  const groups = getApiResponseResources(groupsResults)
  const scopeRows: ScopeTreeRow[] = groups
    ? groups?.map<ScopeTreeRow>((group) => ({
        ...group,
        id: group.id ?? '0',
        name: group.name?.replace(/^Patients passés par: /, '') ?? '',
        quantity: group.quantity ?? 0
      }))
    : []
  return scopeRows
}
