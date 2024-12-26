import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { ProjectType } from 'types'

const useEditProject = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newProjectData: ProjectType) => await services.projects.editProject(newProjectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
      dispatch(setMessage({ type: 'success', content: "L'édition du projet a été réalisée avec succès" }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition du projet" }))
    }
  })
}

export default useEditProject
