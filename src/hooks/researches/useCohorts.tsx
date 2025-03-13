import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { CohortsFilters, Direction, Order, OrderBy } from 'types/searchCriterias'

type UseCohortsProps = {
  orderBy?: OrderBy
  searchInput?: string
  filters?: CohortsFilters
  page?: number
  rowsPerPage?: number
  paramsReady?: boolean
}

const useCohorts = ({
  orderBy = { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
  searchInput,
  filters,
  page = 1,
  rowsPerPage = 20,
  paramsReady
}: UseCohortsProps) => {
  const dispatch = useAppDispatch()

  const fetchCohortsList = async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
    const [, , searchInput, filters, orderBy, page] = queryKey
    const _filters = {
      status: filters?.status ?? [],
      favorite: filters?.favorite ?? [],
      minPatients: filters?.minPatients ?? null,
      maxPatients: filters?.maxPatients ?? null,
      startDate: filters?.startDate ?? null,
      endDate: filters?.endDate ?? null,
      parentId: filters?.parentId
    }
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList({
      filters: _filters.parentId
        ? {
            ..._filters,
            startDate: null,
            endDate: null
          }
        : _filters,
      searchInput: !_filters.parentId ? searchInput : '',
      orderBy: { orderBy: orderBy.orderBy, orderDirection: orderBy.orderDirection },
      limit: rowsPerPage,
      offset,
      signal
    })
    return cohortsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cohorts', 'projectsCount', searchInput, filters, orderBy, page],
    queryFn: fetchCohortsList,
    refetchOnWindowFocus: false,
    enabled: paramsReady
  })

  useEffect(() => {
    isError && dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération des cohortes' }))
  }, [isError, dispatch])

  const cohortsList = data?.results ?? []
  const total = data?.count ?? 0

  return { cohortsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useCohorts
