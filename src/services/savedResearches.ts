import api from './api'
import apiBackCohort from './apiBackCohort'
import { CONTEXT } from '../constants'
// import { IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  Back_API_Response,
  Cohort,
  // FHIR_API_Response,
  FormattedCohort
} from '../types'

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
  }
  if (CONTEXT === 'arkhn') {
    // const cohortResp = await api.get<FHIR_API_Response<IGroup>>(
    //   '/Group?&_sort=-meta.lastUpdated'
    // )

    return {
      results: [],
      count: 0
    }

    // return {
    //   formattedCohort: cohortResp?.data?.entry
    //     .map((group) => {
    //       if (group.resource.error) {
    //         return null
    //       }
    //       // TODO refactor
    //       return {
    //         researchId: group.resource.id,
    //         dossier: 'test',
    //         titre: group.resource.name || 'Nom de la recherche',
    //         statut: 'Actif',
    //         nPatients: group.resource.member ? group.resource.member.length : 0,
    //         date: '05/06/2020',
    //         perimetre: '-'
    //       }
    //     })
    //     .filter(Boolean)
    // }
  } else if (CONTEXT === 'aphp') {
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

    return results
  }
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>('/explorations/cohorts/?favorite=true')

    const results = cohortResp?.data?.results
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

    return results
  }
}

export const fetchLastCohorts = async (): Promise<FormattedCohort[] | undefined> => {
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

    return results
  }
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/explorations/cohorts/?limit=5&ordering=-created_at'
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

    return results
  }
}

export const setFavorite = async (cohortId: string, favStatus: boolean): Promise<boolean> => {
  if (CONTEXT === 'aphp') {
    const response = await apiBackCohort.patch(`/explorations/cohorts/${cohortId}/`, { favorite: !favStatus })
    return response.status === 200
  }
  return false
}

export const onRemoveCohort = async (selectedCohort?: string): Promise<boolean> => {
  if (CONTEXT === 'arkhn') {
    await api.delete(`/Group/${selectedCohort}`)
  } else if (CONTEXT === 'aphp') {
    const deleteRequest = await apiBackCohort.delete(`/explorations/cohorts/${selectedCohort}/`)
    return [200, 204].includes(deleteRequest.status)
  }
  return false
}
