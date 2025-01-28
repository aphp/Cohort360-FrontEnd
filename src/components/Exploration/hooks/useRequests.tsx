import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'

const useRequests = (
  parentId: string | undefined,
  searchInput: string,
  startDate?: string,
  endDate?: string,
  rowsPerPage = 20,
  page = 1
) => {
  // TODO: à externaliser ?
  const fetchRequestsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const offset = (page - 1) * rowsPerPage
    const requestsList = await services.projects.fetchRequestsList(
      parentId,
      searchInput,
      startDate,
      endDate,
      rowsPerPage,
      offset
    )
    return requestsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['requests', 'projectsCount', searchInput, startDate, endDate, page],
    queryFn: fetchRequestsList,
    refetchOnWindowFocus: false
  })

  const requestsList = data?.results ?? []
  const total = data?.count ?? 0

  return { requestsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useRequests
