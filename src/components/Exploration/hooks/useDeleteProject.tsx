import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { ProjectType } from 'types'

const useDeleteProject = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: async (project: ProjectType) => await services.projects.deleteProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      dispatch(setMessage({ type: 'success', content: 'La suppression du projet a été réalisée avec succès' }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la suppression du projet' }))
    }
  })
}

export default useDeleteProject
