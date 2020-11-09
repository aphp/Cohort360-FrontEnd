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
  if (CONTEXT === 'arkhn') {
    // const cohortResp = await api.get<FHIR_API_Response<IGroup>>(
    //   '/Group?&_sort=-meta.lastUpdated'
    // )

    return {
      results: [],
      count: 0
    }

    // return {
    //   formattedCohort: cohortResp.data.entry
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
      `/cohorts/?ordering=-favorite&type=IMPORT_I2B2${searchByText}&limit=20${offset}`
    )

    const results = cohortResp.data.results
      ? cohortResp.data.results
          .map((cohort) => ({
            researchId: cohort.uuid ?? '',
            fhir_groups_ids: cohort.fhir_groups_ids,
            name: cohort.name,
            status: 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimeter: '-',
            favorite: cohort.favorite
          }))
          .filter(Boolean)
      : undefined

    return {
      results: results,
      count: cohortResp.data.count ?? 0
    }
  }
}

export const fetchFavoriteCohorts = async (): Promise<Back_API_Response<FormattedCohort> | undefined> => {
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>('/cohorts/?favorite=true&type=IMPORT_I2B2')

    const results = cohortResp.data.results
      ? cohortResp.data.results
          .map((cohort: Cohort) => {
            return {
              researchId: cohort.uuid ?? '',
              fhir_groups_ids: cohort.fhir_groups_ids,
              name: cohort.name,
              statut: 'Cohorte i2b2',
              nPatients: cohort.result_size,
              date: cohort.created_at,
              perimetre: '-',
              favorite: cohort.favorite
            }
          })
          .filter(Boolean)
      : undefined

    return {
      results: results
    }
  }
}

export const fetchLastCohorts = async (): Promise<Back_API_Response<FormattedCohort> | undefined> => {
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/cohorts/?limit=5&type=IMPORT_I2B2&ordering=-created_at'
    )

    const results = cohortResp.data.results
      ? cohortResp.data.results
          .map((cohort) => ({
            researchId: cohort.uuid ?? '',
            fhir_groups_ids: cohort.fhir_groups_ids,
            name: cohort.name,
            status: 'Cohorte i2b2',
            nPatients: cohort.result_size,
            date: cohort.created_at,
            perimeter: '-',
            favorite: cohort.favorite
          }))
          .filter(Boolean)
      : undefined

    return {
      results: results
    }
  }
}

export const setFavorite = async (cohortId: string, favStatus: boolean) => {
  if (CONTEXT === 'aphp') {
    await apiBackCohort.patch(`/cohorts/${cohortId}/`, { favorite: !favStatus })
  }
}

export const onRemoveCohort = async (selectedCohort?: string) => {
  if (CONTEXT === 'arkhn') {
    await api.delete(`/Group/${selectedCohort}`)
  } else if (CONTEXT === 'aphp') {
    await apiBackCohort.delete(`/cohorts/${selectedCohort}/`)
  }
}
