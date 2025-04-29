import { useQueries } from '@tanstack/react-query'
import services from 'services/aphp'
import { Direction, Order } from 'types/searchCriterias'

const useCounts = (searchInput: string, startDate: string | null, endDate: string | null) => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['projectsCount', searchInput, startDate, endDate],
        queryFn: async () => {
          const res = await services.projects.fetchProjectsList({
            filters: { startDate: startDate ?? null, endDate: endDate ?? null },
            searchInput
          })
          return res.count ?? 0
        },
        enabled: !!(searchInput || startDate || endDate)
      },
      {
        queryKey: ['requestsCount', searchInput, startDate, endDate],
        queryFn: async () => {
          const res = await services.projects.fetchRequestsList({ searchInput, startDate, endDate, limit: 0 })
          return res.count ?? 0
        },
        enabled: !!(searchInput || startDate || endDate)
      },
      {
        queryKey: ['cohortsCount', searchInput, startDate, endDate],
        queryFn: async () => {
          const res = await services.projects.fetchCohortsList({
            filters: {
              startDate: startDate ?? null,
              endDate: endDate ?? null,
              status: [],
              favorite: [],
              minPatients: null,
              maxPatients: null
            },
            isSample: false,
            searchInput,
            orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
            limit: 0
          })
          return res.count ?? 0
        },
        enabled: !!(searchInput || startDate || endDate)
      },
      {
        queryKey: ['samplesCount', searchInput, startDate, endDate],
        queryFn: async () => {
          const res = await services.projects.fetchCohortsList({
            filters: {
              startDate: startDate ?? null,
              endDate: endDate ?? null,
              status: [],
              favorite: [],
              minPatients: null,
              maxPatients: null
            },
            isSample: true,
            searchInput,
            orderBy: { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
            limit: 0
          })
          return res.count ?? 0
        },
        enabled: !!(searchInput || startDate || endDate)
      }
    ]
  })

  const projectsCountQuery = results[0]
  const requestsCountQuery = results[1]
  const cohortsCountQuery = results[2]
  const samplesCountQuery = results[3]

  const loading =
    projectsCountQuery.isLoading ||
    requestsCountQuery.isLoading ||
    cohortsCountQuery.isLoading ||
    samplesCountQuery.isLoading

  const isError =
    projectsCountQuery.isError || requestsCountQuery.isError || cohortsCountQuery.isError || samplesCountQuery.isError

  return {
    loading,
    isError,
    projectsCount: projectsCountQuery.data ?? 0,
    requestsCount: requestsCountQuery.data ?? 0,
    cohortsCount: cohortsCountQuery.data ?? 0,
    samplesCount: samplesCountQuery.data ?? 0
  }
}

export default useCounts
