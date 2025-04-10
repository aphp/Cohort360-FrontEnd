import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setProjectsList } from 'state/project'
import { ProjectType } from 'types'
import { replaceItem } from 'utils/explorationUtils'

const useEditProject = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const projectsState = useAppSelector((state) => state.project)

  return useMutation({
    mutationFn: async (newProjectData: ProjectType) => await services.projects.editProject(newProjectData),
    onSuccess: (data, editedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projectsCount'] })
      queryClient.invalidateQueries({ queryKey: ['project'] })
      dispatch(setMessage({ type: 'success', content: "L'édition du projet a été réalisée avec succès" }))
      // à supprimer si délétion du store project
      dispatch(
        setProjectsList({
          projectsList: replaceItem(editedProject, projectsState.projectsList)
        })
      )
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition du projet" }))
    }
  })
}

export default useEditProject
