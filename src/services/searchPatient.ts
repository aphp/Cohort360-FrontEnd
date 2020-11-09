import api from './api'
import { CONTEXT, API_RESOURCE_TAG } from '../constants'
import { getLastEncounter } from './myPatients'
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { FHIR_API_Response, SearchByTypes } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import { getServices } from './perimeters'

export const searchPatient = async (input: string, searchBy: SearchByTypes, groupId?: string) => {
  const patientSet: Set<IPatient> = new Set()

  if (CONTEXT === 'arkhn') {
    let searchByFamily = ''
    let searchByGiven = ''
    let searchByIdentifier = ''
    let filterByService = ''
    if (groupId) {
      const services = (await getServices(groupId)).filter((service) => undefined !== service.id)
      const serviceIds = services.map((service) => service.id)
      filterByService = `&_has:Encounter:subject:service-provider=${serviceIds.join(',')}`
    }
    if (input.trim() !== '') {
      searchByFamily = `family=${input}`
      searchByGiven = `given=${input}`
      searchByIdentifier = `identifier=${input}`

      switch (searchBy) {
        case SearchByTypes.family: {
          const matchFamily = await api.get<FHIR_API_Response<IPatient>>(
            `/Patient?${searchByFamily}${filterByService}${API_RESOURCE_TAG}&_count=10000`
          )
          getApiResponseResources(matchFamily)?.forEach((patient) => patientSet.add(patient))
          break
        }
        case SearchByTypes.given: {
          const matchGiven = await api.get<FHIR_API_Response<IPatient>>(
            `/Patient?${searchByGiven}${filterByService}${API_RESOURCE_TAG}&_count=10000`
          )
          getApiResponseResources(matchGiven)?.forEach((patient) => patientSet.add(patient))
          break
        }
        case SearchByTypes.identifier: {
          const matchIPP = await api.get<FHIR_API_Response<IPatient>>(
            `/Patient?${searchByIdentifier}${filterByService}${API_RESOURCE_TAG}&_count=10000`
          )
          getApiResponseResources(matchIPP)?.forEach((patient) => patientSet.add(patient))
          break
        }
        default: {
          const [matchIPP, matchFamily, matchGiven] = await Promise.all([
            api.get<FHIR_API_Response<IPatient>>(
              `/Patient?${searchByIdentifier}${filterByService}${API_RESOURCE_TAG}&_count=10000`
            ),
            api.get<FHIR_API_Response<IPatient>>(
              `/Patient?${searchByFamily}${filterByService}${API_RESOURCE_TAG}&_count=10000`
            ),
            api.get<FHIR_API_Response<IPatient>>(
              `/Patient?${searchByGiven}${filterByService}${API_RESOURCE_TAG}&_count=10000`
            )
          ])
          getApiResponseResources(matchIPP)?.forEach((patient) => patientSet.add(patient))
          getApiResponseResources(matchFamily)?.forEach((patient) => patientSet.add(patient))
          getApiResponseResources(matchGiven)?.forEach((patient) => patientSet.add(patient))
          break
        }
      }
    } else {
      const patients = getApiResponseResources(
        await api.get<FHIR_API_Response<IPatient>>(`/Patient?_count=10000${filterByService}${API_RESOURCE_TAG}`)
      )
      patients && patients.forEach((patient) => patientSet.add(patient))
    }

    return [...patientSet]
  } else if (CONTEXT === 'aphp') {
    const patientList = await api.get<FHIR_API_Response<IPatient>>(`/Patient?${searchBy}=${input}`)

    if (patientList.data.resourceType === 'OperationOutcome') return

    if (!patientList.data.total) {
      return []
    } else {
      if (patientList.data.entry) {
        patientList.data.entry.forEach((item) => item.resource && patientSet.add(item.resource))
      } else {
        return []
      }
    }

    return await getLastEncounter([...patientSet].filter(Boolean))
  }
}
