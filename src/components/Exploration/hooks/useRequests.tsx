import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { Direction, Order, OrderBy } from 'types/searchCriterias'

type UseRequestsProps = {
  orderBy?: OrderBy
  parentId?: string
  searchInput?: string
  startDate?: string
  endDate?: string
  rowsPerPage?: number
  page?: number
}

const useRequests = ({
  orderBy = { orderBy: Order.UPDATED, orderDirection: Direction.DESC },
  parentId,
  searchInput,
  startDate,
  endDate,
  rowsPerPage = 20,
  page = 1
}: UseRequestsProps) => {
  // TODO: à externaliser ?
  const fetchRequestsList = async () => {
    // TODO: modifier le service de sorte à ajouter les filtres + try/catch
    const offset = (page - 1) * rowsPerPage
    const requestsList = await services.projects.fetchRequestsList({
      orderBy,
      parentId,
      searchInput,
      startDate,
      endDate,
      limit: rowsPerPage,
      offset
    })
    return requestsList
  }
  // TODO: tester si maj correcte en cas de changement de parentid
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['requests', 'projectsCount', orderBy, searchInput, startDate, endDate, page],
    queryFn: fetchRequestsList,
    refetchOnWindowFocus: false
  })

  const requestsList = data?.results ?? []
  const total = data?.count ?? 0

  return { requestsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useRequests
