import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
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
  const dispatch = useAppDispatch()

  const fetchRequestsList = async () => {
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

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['requests', 'projectsCount', orderBy, searchInput, startDate, endDate, page],
    queryFn: fetchRequestsList,
    refetchOnWindowFocus: false
  })

  useEffect(() => {
    isError && dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération des requêtes' }))
  }, [isError, dispatch])

  const requestsList = data?.results ?? []
  const total = data?.count ?? 0

  return { requestsList, total, loading: isLoading || isFetching, isError, error, refetch }
}

export default useRequests
