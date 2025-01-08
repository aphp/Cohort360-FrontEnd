import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'

const useRequests = (
  projectId: string | undefined,
  searchInput: string,
  startDate?: string,
  endDate?: string,
  page = 1
) => {
  // TODO: à externaliser ?
  const fetchRequestsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const rowsPerPage = 20
    const offset = (page - 1) * rowsPerPage
    const requestsList = await services.projects.fetchRequestsList(rowsPerPage, offset)
    return requestsList
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['requests', searchInput, startDate, endDate],
    queryFn: fetchRequestsList
  })

  const requestsList = data?.results ?? []
  const total = data?.count ?? 0

  return { requestsList, total, loading: isLoading, isError, error, refetch }
}

export default useRequests
