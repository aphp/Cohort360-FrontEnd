import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { CohortsFilters, OrderBy } from 'types/searchCriterias'

const useCohorts = (orderBy: OrderBy, searchInput: string, filters: CohortsFilters, page = 1, rowsPerPage = 20) => {
  // TODO: à externaliser
  const fetchCohortsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList(
      filters.parentId
        ? {
            ...filters,
            startDate: null,
            endDate: null
          }
        : filters,
      !filters.parentId ? searchInput : '',
      { orderBy: orderBy.orderBy, orderDirection: orderBy.orderDirection },
      rowsPerPage,
      offset
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
