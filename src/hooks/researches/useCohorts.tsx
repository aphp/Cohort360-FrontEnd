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
  isSample?: boolean
  parentCohort?: string
  parentRequest?: string
  page?: number
  rowsPerPage?: number
  paramsReady?: boolean
}

const useCohorts = ({
  orderBy = { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
  searchInput,
  filters,
  isSample = false,
  parentCohort,
  parentRequest,
  page = 1,
  rowsPerPage = 20,
  paramsReady
}: UseCohortsProps) => {
  const dispatch = useAppDispatch()

  const fetchCohortsList = async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
    const [, , searchInput, filters, orderBy, page, isSample, parentCohort, parentRequest] = queryKey
    const _filters = {
      status: filters?.status ?? [],
      favorite: filters?.favorite ?? [],
      minPatients: filters?.minPatients ?? null,
      maxPatients: filters?.maxPatients ?? null,
      startDate: filters?.startDate ?? null,
      endDate: filters?.endDate ?? null
    }
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList({
      filters:
        parentRequest || parentCohort
          ? {
              ..._filters,
              startDate: null,
              endDate: null
            }
          : _filters,
      searchInput: !parentRequest && !parentCohort ? searchInput : '',
      isSample,
      parentCohort,
      parentRequest,
      orderBy: { orderBy: orderBy.orderBy, orderDirection: orderBy.orderDirection },
      limit: rowsPerPage,
      offset,
      signal
    })
    return cohortsList
  }

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['cohorts', 'projectsCount', searchInput, filters, orderBy, page, isSample, parentCohort, parentRequest],
    queryFn: fetchCohortsList,
    refetchOnWindowFocus: false,
    enabled: paramsReady
  })

  useEffect(() => {
    if (isError) {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération des cohortes' }))
    }
  }, [isError, dispatch])

  const cohortsList = data?.results ?? []
  const total = data?.count ?? 0

  return { list: cohortsList, total, loading: isLoading || isFetching, isError, error }
}

export default useCohorts
