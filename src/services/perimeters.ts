import { IOrganization, IEncounter, IPatient, IGroup, IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'

import api from './api'
import {
  getAgeRepartitionMap,
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMap,
  getEncounterRepartitionMapAphp,
  getGenderRepartitionMap,
  getGenderRepartitionMapAphp,
  getVisitRepartitionMap,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { CONTEXT } from '../constants'
import fakeGroup from '../data/fakeData/group'
import fakeFacetDeceased from '../data/fakeData/facet-deceased'
import fakeFacetAgeMonth from '../data/fakeData/facet-age-month'
import fakeFacetClassSimple from '../data/fakeData/facet-class-simple'
import fakeFacetStartDateFacet from '../data/fakeData/facet-start-date-facet'
import fakePatients from '../data/fakeData/patients'
import { CohortData, FHIR_API_Response, ScopeTreeRow } from 'types'
import { getServicePatientsCount } from './scopeService'

export const getOrganizations = async (ids?: string[]): Promise<IOrganization[]> => {
  const orgaIdsParam = ids ? `?_id=${ids.join(',')}` : ''
  const respOrganizations = await api.get<FHIR_API_Response<IOrganization>>(`/Organization${orgaIdsParam}`)
  return getApiResponseResources(respOrganizations) ?? []
}

export const getPractitionerPerimeters = async (practitionerId: string) => {
  const resp = await api.get<FHIR_API_Response<IOrganization | IPractitionerRole>>(
    `/PractitionerRole?permission-status=active&practitioner=${practitionerId}&_include=PractitionerRole:organization`
  )
  const organizations =
    (getApiResponseResources(resp)?.filter(({ resourceType }) => resourceType === 'Organization') as IOrganization[]) ??
    []
  const organizationsWithTotal = await Promise.all(organizations.map(getServicePatientsCount))

  return organizationsWithTotal.map(({ service, patientCount }) => ({ ...service, patientCount }))
}

const getPatientsAndEncountersFromServiceId = async (serviceId: string) => {
  const serviceEncountersAndPatients =
    getApiResponseResources(
      await api.get<FHIR_API_Response<IPatient | IEncounter>>(
        `/Encounter?service-provider=${serviceId}&_include=Encounter:subject&_count=10000`
      )
    ) ?? []

  const encounters = serviceEncountersAndPatients.filter(
    ({ resourceType }) => resourceType === 'Encounter'
  ) as IEncounter[]
  const patients = serviceEncountersAndPatients.filter(({ resourceType }) => resourceType === 'Patient') as IPatient[]

  return {
    encounters,
    patients
  }
}

export const fetchPerimetersInfos = async (perimeterIds: string[]): Promise<CohortData | undefined> => {
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
  if (CONTEXT === 'arkhn') {
    const services = await getOrganizations(perimeterIds)
    const serviceIds = services.map((service) => service.id)

    const patientsAndEncountersFromServices = await getPatientsAndEncountersFromServiceId(serviceIds.join(','))
    if (patientsAndEncountersFromServices) {
      const { patients, encounters } = patientsAndEncountersFromServices

      return {
        name: 'Périmètres',
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
  return groups
    ? groups?.map<ScopeTreeRow>((group) => ({
        ...group,
        id: group.id ?? '0',
        name: group.name?.replace(/^Patients passés par: /, '') ?? '',
        quantity: group.quantity ?? 0
      }))
    : []
}
