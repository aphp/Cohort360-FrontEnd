import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { ProjectType } from 'types'

const useCreateProject = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProjectData: Omit<ProjectType, 'uuid'>) => await services.projects.addProject(newProjectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'ajout du projet" }))
    }
  })
}

export default useCreateProject
