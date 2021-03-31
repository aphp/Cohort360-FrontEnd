import api from './api'
import apiBackCohort from './apiBackCohort'
import { CONTEXT } from '../constants'
// import { IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import { Back_API_Response, Cohort, FormattedCohort } from '../types'

export const fetchCohorts = async (
  searchInput?: string,
  page?: number
): Promise<Back_API_Response<FormattedCohort> | undefined> => {
  if (CONTEXT === 'fakedata') {
    const results = [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true
      }
    ]

    return {
      results: results,
      count: 1
    }
  } else {
    let searchByText = ''
    let offset = ''

    if (searchInput) {
      searchByText = `&search=${searchInput}`
    }

    if (page) {
      offset = `&offset=${(page - 1) * 20}`
    }

    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      `/explorations/cohorts/?ordering=-favorite${searchByText}&limit=20${offset}`
    )

    const results = cohortResp?.data?.results
      ? cohortResp.data.results
          .map((cohort) => ({
            researchId: cohort.uuid ?? '',
            fhir_group_id: cohort.fhir_group_id,
            name: cohort.name,
            status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimeter: '-',
            favorite: cohort.favorite
          }))
          .filter(Boolean)
      : undefined

    return {
      results: results,
      count: cohortResp?.data?.count ?? 0
    }
  }
}

export const fetchFavoriteCohorts = async (): Promise<FormattedCohort[] | undefined> => {
  if (CONTEXT === 'fakedata') {
    return [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true
      }
    ]
  } else {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>('/explorations/cohorts/?favorite=true')

    return cohortResp?.data?.results
      ? cohortResp.data.results
          .map((cohort: Cohort) => {
            return {
              researchId: cohort.uuid ?? '',
              fhir_group_id: cohort.fhir_group_id,
              name: cohort.name,
              status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
              nPatients: cohort.result_size,
              date: cohort.created_at,
              perimeter: '-',
              favorite: cohort.favorite
            }
          })
          .filter(Boolean)
      : undefined
  }
}

export const fetchLastCohorts = async (): Promise<FormattedCohort[] | undefined> => {
  if (CONTEXT === 'fakedata') {
    return [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true
      }
    ]
  } else {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/explorations/cohorts/?limit=5&ordering=-created_at'
    )

    return cohortResp?.data?.results
      ? cohortResp.data.results
          .map((cohort) => ({
            researchId: cohort.uuid ?? '',
            fhir_group_id: cohort.fhir_group_id,
            name: cohort.name,
            status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimeter: '-',
            favorite: cohort.favorite
          }))
          .filter(Boolean)
          .reverse()
      : undefined
  }
}

export const setFavorite = async (cohortId: string, favStatus: boolean): Promise<boolean> => {
  if (CONTEXT !== 'fakedata') {
    const response = await apiBackCohort.patch(`/explorations/cohorts/${cohortId}/`, { favorite: !favStatus })
    return response.status === 200
  }
  return false
}

export const onRemoveCohort = async (selectedCohort?: string): Promise<boolean> => {
  if (CONTEXT !== 'fakedata') {
    const response = await apiBackCohort.get(`/explorations/cohorts/${selectedCohort}/`)
    const fhir_group_id = response.data.fhir_group_id
    await api.delete(`/Group/${fhir_group_id}`)
    const deleteRequest = await apiBackCohort.delete(`/explorations/cohorts/${selectedCohort}/`)
    return [200, 204].includes(deleteRequest.status)
  }
  return false
}
