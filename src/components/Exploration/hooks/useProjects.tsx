import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'

const useProjects = (searchInput: string, startDate?: string, endDate?: string) => {
  const fetchProjectsList = async () => {
    const projectsList = await services.projects.fetchProjectsList(searchInput, startDate, endDate)
    return projectsList
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', searchInput, startDate, endDate],
    queryFn: fetchProjectsList
  })

  const projectsList = data?.results ?? []
  const total = data?.count ?? 0

  return {
    projectsList,
    total,
    loading: isLoading,
    isError,
    error,
    refetch
  }
}

export default useProjects
