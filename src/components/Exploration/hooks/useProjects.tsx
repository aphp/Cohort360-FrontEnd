import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'
import { OrderBy, ProjectsFilters } from 'types/searchCriterias'

type UseProjectsProps = {
  filters?: ProjectsFilters
  searchInput?: string
  orderBy?: OrderBy
}

const useProjects = ({ filters, searchInput, orderBy }: UseProjectsProps) => {
  const fetchProjectsList = async () => {
    const limit = 100
    const projectsList = await services.projects.fetchProjectsList({ filters, searchInput, order: orderBy, limit })
    return projectsList
  }

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['projects', searchInput, filters, orderBy],
    queryFn: fetchProjectsList,
    refetchOnWindowFocus: false
  })

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
