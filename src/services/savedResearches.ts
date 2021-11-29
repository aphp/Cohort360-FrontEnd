import api from './apiFhir'
import apiBackCohort from './apiBackend'
import { CONTEXT } from '../constants'
// import { IGroup } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  Back_API_Response,
  Cohort,
  CohortFilters,
  // FHIR_API_Response,
  FormattedCohort,
  ValueSet
} from 'types'

import services from './index'
import displayDigit from 'utils/displayDigit'

export const fetchCohorts = async (
  sortBy: string,
  sortDirection: string,
  filters?: CohortFilters,
  searchInput?: string,
  page?: number
): Promise<Back_API_Response<FormattedCohort> | undefined> => {
  if (CONTEXT === 'fakedata') {
    const results = [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        description: 'Ceci est une fausse cohort créée pour des tests',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true,
        jobFailMsg: ''
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
    const _sortDirection = sortDirection === 'desc' ? '-' : ''
    const typeFilter = filters && filters.type && filters.type !== 'all' ? `&type=${filters.type}` : ''
    const statusFilter =
      filters && filters.status && filters.status.length > 0
        ? `&request_job_status=${filters.status.map((status: ValueSet) => status.code).join()}`
        : ''
    const minPatientsFilter = filters && filters.minPatients ? `&min_result_size=${filters.minPatients}` : ''
    const maxPatientsFilter = filters && filters.maxPatients ? `&max_result_size=${filters.maxPatients}` : ''
    const startDateFilter = filters && filters.startDate ? `&min_fhir_datetime=${filters.startDate}` : ''
    const endDateFilter = filters && filters.endDate ? `&max_fhir_datetime=${filters.endDate}` : ''
    const favoriteFilter =
      filters && filters.favorite && filters.favorite !== 'all' ? `&favorite=${filters.favorite}` : ''
    let searchByText = ''
    let offset = ''

    if (searchInput) {
      searchByText = `&search=${searchInput}`
    }

    if (page) {
      offset = `&offset=${(page - 1) * 20}`
    }

    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      `/explorations/cohorts/?ordering=${_sortDirection}${sortBy}${typeFilter}${statusFilter}${minPatientsFilter}${maxPatientsFilter}${startDateFilter}${endDateFilter}${favoriteFilter}${searchByText}&limit=20${offset}`
    )

    let cohortResult: FormattedCohort[] = []
    // @ts-ignore
    if (!cohortResp || !cohortResp.data || !cohortResp.data.results || cohortResp.data.results.length === 0) return []

    // @ts-ignore
    for (const cohort of cohortResp?.data?.results) {
      const canMakeExport = await services.cohorts.fetchCohortExportRight(cohort.fhir_group_id ?? '')

      cohortResult = [
        ...cohortResult,
        {
          researchId: cohort.uuid ?? '',
          fhir_group_id: cohort.fhir_group_id,
          name: cohort.name,
          description: cohort.description,
          status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
          nPatients: cohort.result_size,
          nGlobal: cohort.dated_measure_global
            ? `${displayDigit(cohort.dated_measure_global.measure_min) ?? 'X'} - ${
                displayDigit(cohort.dated_measure_global.measure_max) ?? 'X'
              }`
            : undefined,
          date: cohort.dated_measure.fhir_datetime,
          perimeter: '-',
          favorite: cohort.favorite,
          jobStatus: cohort.request_job_status,
          jobFailMsg: cohort.request_job_fail_msg,
          canMakeExport
        }
      ]
    }

    return {
      results: cohortResult,
      count: cohortResp?.data?.count ?? 0
    }
  }
}

export const fetchFavoriteCohorts = async (providerId: string | undefined): Promise<FormattedCohort[] | undefined> => {
  if (CONTEXT === 'fakedata') {
    const results = [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        description: 'Ceci est une fausse cohort créée pour des tests',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true,
        jobStatus: 'finished',
        jobFailMsg: ''
      }
    ]

    return results
  }
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/explorations/cohorts/?favorite=true&ordering=-fhir_datetime&limit=5'
    )

    let cohortResult: FormattedCohort[] = []
    // @ts-ignore
    if (!cohortResp || !cohortResp.data || !cohortResp.data.results || cohortResp.data.results.length === 0) return []

    // @ts-ignore
    for (const cohort of cohortResp?.data?.results) {
      const canMakeExport = await services.cohorts.fetchCohortExportRight(cohort.fhir_group_id ?? '', providerId ?? '')

      cohortResult = [
        ...cohortResult,
        {
          researchId: cohort.uuid ?? '',
          fhir_group_id: cohort.fhir_group_id,
          name: cohort.name,
          description: cohort.description,
          status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
          nPatients: cohort.result_size,
          nGlobal: cohort.dated_measure_global
            ? `${displayDigit(cohort.dated_measure_global.measure_min) ?? 'X'} - ${
                displayDigit(cohort.dated_measure_global.measure_max) ?? 'X'
              }`
            : undefined,
          date: cohort.dated_measure.fhir_datetime,
          perimeter: '-',
          favorite: cohort.favorite,
          jobStatus: cohort.request_job_status,
          jobFailMsg: cohort.request_job_fail_msg,
          canMakeExport
        }
      ]
    }

    return cohortResult
  }
}

export const fetchLastCohorts = async (providerId: string | undefined): Promise<FormattedCohort[] | undefined> => {
  if (CONTEXT === 'fakedata') {
    const results = [
      {
        researchId: '123456789',
        fhir_group_id: '123456789',
        name: 'Fausse cohorte',
        description: 'Ceci est une fausse cohort créée pour des tests',
        status: 'Cohort360',
        nPatients: 12,
        date: '2021-01-20T10:28:28.385368Z',
        perimeter: '-',
        favorite: true,
        jobFailMsg: ''
      }
    ]

    return results
  }
  if (CONTEXT === 'aphp') {
    const cohortResp = await apiBackCohort.get<Back_API_Response<Cohort>>(
      '/explorations/cohorts/?limit=5&ordering=-fhir_datetime'
    )

    let cohortResult: FormattedCohort[] = []
    // @ts-ignore
    if (!cohortResp || !cohortResp.data || !cohortResp.data.results || cohortResp.data.results.length === 0) return []

    // @ts-ignore
    for (const cohort of cohortResp?.data?.results) {
      const canMakeExport = await services.cohorts.fetchCohortExportRight(cohort.fhir_group_id ?? '', providerId ?? '')

      cohortResult = [
        ...cohortResult,
        {
          researchId: cohort.uuid ?? '',
          fhir_group_id: cohort.fhir_group_id,
          name: cohort.name,
          description: cohort.description,
          status: cohort.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohorte i2b2',
          nPatients: cohort.result_size,
          nGlobal: cohort.dated_measure_global
            ? `${displayDigit(cohort.dated_measure_global.measure_min) ?? 'X'} - ${
                displayDigit(cohort.dated_measure_global.measure_max) ?? 'X'
              }`
            : undefined,
          date: cohort.dated_measure.fhir_datetime,
          perimeter: '-',
          favorite: cohort.favorite,
          jobStatus: cohort.request_job_status,
          jobFailMsg: cohort.request_job_fail_msg,
          canMakeExport
        }
      ]
    }

    return cohortResult
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
