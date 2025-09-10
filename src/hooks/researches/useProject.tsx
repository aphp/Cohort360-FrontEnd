import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'

const useProject = (projectId?: string) => {
  const dispatch = useAppDispatch()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', 'projectsCount', projectId],
    enabled: !!projectId, // ça veut dire qu'on fait pas l'appel si pas de projectId
    queryFn: async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
      const [, , projectId] = queryKey
      if (!projectId) return null
      const projectData = await services.projects.fetchProject(projectId, signal)
      return projectData
    }
  })

  useEffect(() => {
    if (isError) {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération du projet' }))
    }
  }, [isError, dispatch])

  return {
    project: data,
    projectLoading: isLoading,
    projectIsError: isError,
    error,
    refetch
  }
}

export default useProject
