import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'

const useProject = (projectId?: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', projectId],
    enabled: !!projectId, // ça veut dire qu'on fait pas l'appel si pas de projectId
    queryFn: async () => {
      if (!projectId) return null
      const projectData = await services.projects.fetchProject(projectId)
      return projectData
    }
  })

  return {
    project: data,
    projectLoading: isLoading,
    projectIsError: isError,
    error,
    refetch
  }
}

export default useProject
