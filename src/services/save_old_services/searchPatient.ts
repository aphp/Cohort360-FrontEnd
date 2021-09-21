import api from '../apiFhir'
import { CONTEXT, API_RESOURCE_TAG } from '../../constants'
import { IPatient } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortPatient, FHIR_API_Response, SearchByTypes } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import { getServices } from './perimeters'

import fakePatients from 'data/fakeData/patients'

export const searchPatient = async (
  nominativeGroupsIds: string[] | undefined,
  page: number,
  sortBy: string,
  sortDirection: string,
  input: string,
  searchBy: SearchByTypes,
  groupId?: string
) => {
  const patientSet: Set<IPatient> = new Set()

  if (CONTEXT === 'fakedata') {
    const patientList = fakePatients as CohortPatient[]

    const totalPatients = fakePatients.length

    return {
      patientList,
      totalPatients: totalPatients ?? 0
    }
  }

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

    return { patientList: [...patientSet], totalPatients: [...patientSet].length }
  } else if (CONTEXT === 'aphp') {
    const _sortDirection = sortDirection === 'desc' ? '-' : ''

    let search = ''

    if (input.trim() !== '') {
      if (searchBy === '_text') {
        const searches = input
          .trim() // Remove space before/after search
          .split(' ') // Split by space (= ['mot1', 'mot2' ...])
          .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)

        for (const _search of searches) {
          search = search ? `${search} AND "${_search}"` : `"${_search}"`
        }
      } else {
        search = input.trim()
      }
    }

    const patientResp = await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?_list=${nominativeGroupsIds}&size=20&offset=${
        page ? (page - 1) * 20 : 0
      }&_sort=${_sortDirection}${sortBy}&${searchBy}=${search}&_elements=gender,name,birthDate,deceased,identifier,extension`
    )

    const patientList = getApiResponseResources(patientResp)

    const totalPatients = patientResp.data.resourceType === 'Bundle' ? patientResp.data.total : 0

    return {
      patientList,
      totalPatients: totalPatients ?? 0
    }
  }
}
