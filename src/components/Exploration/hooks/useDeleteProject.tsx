import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setProjectsList } from 'state/project'
import { ProjectType } from 'types'

const useDeleteProject = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const projectsState = useAppSelector((state) => state.project)

  return useMutation({
    mutationFn: async (project: ProjectType) => await services.projects.deleteProject(project),
    onSuccess: (data, deletedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      dispatch(setMessage({ type: 'success', content: 'La suppression du projet a été réalisée avec succès' }))
      // à supprimer si délétion du store project
      dispatch(
        setProjectsList({
          projectsList: projectsState.projectsList.filter((project) => project.uuid !== deletedProject.uuid),
          count: projectsState.count - 1 < 0 ? 0 : projectsState.count - 1
        })
      )
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la suppression du projet' }))
    }
  })
}

export default useDeleteProject
