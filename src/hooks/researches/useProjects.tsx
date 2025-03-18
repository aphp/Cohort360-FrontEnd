import { useEffect } from 'react'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { useQuery } from '@tanstack/react-query'
import { OrderBy, ProjectsFilters } from 'types/searchCriterias'
import { setMessage } from 'state/message'

type UseProjectsProps = {
  filters?: ProjectsFilters
  searchInput?: string
  orderBy?: OrderBy
  paramsReady: boolean
}

const useProjects = ({ filters, searchInput, orderBy, paramsReady }: UseProjectsProps) => {
  const dispatch = useAppDispatch()

  const fetchProjectsList = async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
    const [, searchInput, filters, orderBy] = queryKey
    const limit = 100
    const projectsList = await services.projects.fetchProjectsList({
      filters,
      searchInput,
      order: orderBy,
      limit,
      signal
    })
    return projectsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['projects', searchInput, filters, orderBy],
    queryFn: fetchProjectsList,
    refetchOnWindowFocus: false,
    enabled: paramsReady
  })

  useEffect(() => {
    isError && dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération des projets' }))
  }, [isError, dispatch])

  const projectsList = data?.results ?? []
  const total = data?.count ?? 0

  return {
    projectsList,
    total,
    loading: isLoading || isFetching,
    isError,
    error,
    refetch
  }
}

export default useProjects
