import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { ProjectType } from 'types'

const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project: ProjectType) => await services.projects.deleteProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export default useDeleteProject
