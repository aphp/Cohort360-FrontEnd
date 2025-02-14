import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { CohortsType } from 'types/cohorts'
import { CohortsFilters, Direction, Order, OrderBy } from 'types/searchCriterias'

type UseCohortsProps = {
  orderBy?: OrderBy
  searchInput?: string
  filters?: CohortsFilters
  page?: number
  rowsPerPage?: number
}

const useCohorts = ({
  orderBy = { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
  searchInput,
  filters,
  page = 1,
  rowsPerPage = 20
}: UseCohortsProps) => {
  // TODO: à externaliser ?
  const fetchCohortsList = async () => {
    const _filters = {
      status: filters?.status ?? [],
      favorite: filters?.favorite ?? [],
      minPatients: filters?.minPatients ?? null,
      maxPatients: filters?.maxPatients ?? null,
      startDate: filters?.startDate ?? null,
      endDate: filters?.endDate ?? null,
      parentId: filters?.parentId
    }
    // TODO: modifier le service de sorte à ajouter try/catch
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList(
      {
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
        offset
      }
      //   AbortSignal???
    )
    return cohortsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cohorts', 'projectsCount', searchInput, filters, orderBy, page],
    queryFn: fetchCohortsList,
    refetchOnWindowFocus: false
  })

  const cohortsList = data?.results ?? []
  const total = data?.count ?? 0

  return { cohortsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useCohorts
