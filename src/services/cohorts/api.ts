import services from 'services/aphp'
import { Cohort } from 'types'
import { CohortsType } from 'types/cohorts'
import { SearchCriterias, CohortsFilters, Order, Direction, OrderBy } from 'types/searchCriterias'
import { JobStatus } from 'utils/constants'

export type FetchCohortsResponse = {
  count: number
  selectedCohort?: null
  cohortsList: Cohort[]
}

type FetchCohortsParams = {
  options?: {
    page?: number
    limit?: number
    searchCriterias?: SearchCriterias<CohortsFilters | null>
  }
  signal?: AbortSignal
}

export const fetchCohorts = async ({ options, signal }: FetchCohortsParams): Promise<FetchCohortsResponse> => {
  try {
    const cohortsType = options?.searchCriterias?.filters?.favorite || CohortsType.ALL
    const orderBy = options?.searchCriterias?.orderBy || {
      orderBy: Order.MODIFIED,
      orderDirection: Direction.DESC
    }
    const filters = options?.searchCriterias?.filters || {
      status: [],
      favorite: cohortsType,
      minPatients: null,
      maxPatients: null,
      startDate: null,
      endDate: null
    }
    const limit = options?.limit || 20
    const offset = ((options?.page ?? 1) - 1) * limit
    const searchInput = options?.searchCriterias?.searchInput || ''

    const cohorts =
      (await services.projects.fetchCohortsList(filters, searchInput, orderBy, limit, offset, signal)) || {}

    const cohortsList: Cohort[] = cohorts.results || []

    const forceRefresh = cohorts?.results?.some(
      (cohortList) =>
        !cohortList.fhir_group_id &&
        (cohortList.request_job_status === JobStatus.pending || cohortList.request_job_status === JobStatus.new)
    )

    if (forceRefresh) {
      fetchCohortInBackGround({
        cohortsType: cohortsType,
        oldCohortsList: cohortsList,
        filters: filters,
        searchInput: searchInput,
        sort: orderBy,
        limit: limit,
        offset: offset
      })
    }
    return {
      count: cohorts.count,
      selectedCohort: null,
      cohortsList: cohortsList
    }
  } catch (error) {
    console.error(error)
    return {
      count: 0,
      selectedCohort: null,
      cohortsList: []
    }
  }
}

type FetchCohortInBackGroundParams = {
  cohortsType?: CohortsType
  oldCohortsList: Cohort[]
  filters: CohortsFilters
  searchInput: string
  sort: OrderBy
  limit: number
  offset: number
}

const fetchCohortInBackGround = async ({
  cohortsType = CohortsType.ALL,
  oldCohortsList,
  filters,
  searchInput,
  sort,
  limit,
  offset
}: FetchCohortInBackGroundParams) => {
  try {
    let count = 0
    let cohortsList = oldCohortsList

    while (
      cohortsList?.some(
        (cohort) =>
          !cohort.fhir_group_id &&
          (cohort.request_job_status === JobStatus.pending || cohort.request_job_status === JobStatus.new)
      )
    ) {
      const newResult = await services.projects.fetchCohortsList(filters, searchInput, sort, limit, offset)

      count = newResult.count
      cohortsList = newResult.results
      const sleep = (m: any) => new Promise((r: any) => setTimeout(r, m))
      await sleep(2500)
    }

    return {
      count,
      ...(cohortsType === CohortsType.ALL && { cohortsList: cohortsList }),
      ...(cohortsType === CohortsType.FAVORITE && { favoriteCohortsList: cohortsList }),
      ...(cohortsType === CohortsType.LAST && { lastCohorts: cohortsList })
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
