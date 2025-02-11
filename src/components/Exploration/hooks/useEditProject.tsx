import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { ProjectType } from 'types'

const useEditProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProjectData: ProjectType) => await services.projects.editProject(newProjectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
    }
  })
}

export default useEditProject
