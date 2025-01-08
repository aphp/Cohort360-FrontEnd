import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { ProjectType } from 'types'

const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProjectData: Omit<ProjectType, 'uuid'>) => await services.projects.addProject(newProjectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export default useCreateProject
