import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { CohortsType } from 'types/cohorts'
import { Direction, Order } from 'types/searchCriterias'

const useCohorts = (parentId: string, searchInput: string, startDate?: string, endDate?: string, page = 1) => {
  // TODO: à externaliser
  const fetchCohortsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const rowsPerPage = 20
    const offset = (page - 1) * rowsPerPage
    const cohortsList = await services.projects.fetchCohortsList(
      parentId
        ? {
            startDate: null,
            endDate: null,
            status: [],
            favorite: CohortsType.ALL,
            minPatients: null,
            maxPatients: null,
            parentId
          }
        : {
            startDate: startDate ?? null,
            endDate: endDate ?? null,
            status: [],
            favorite: CohortsType.ALL,
            minPatients: null,
            maxPatients: null,
            parentId
          },
      !parentId ? searchInput : '',
      { orderBy: Order.CREATED_AT, orderDirection: Direction.DESC },
      rowsPerPage,
      offset
      //   AbortSignal???
    )
    return cohortsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['cohorts', 'projectsCount', searchInput, startDate, endDate, page],
    queryFn: fetchCohortsList
  })

  const cohortsList = data?.results ?? []
  const total = data?.count ?? 0

  return { cohortsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useCohorts
