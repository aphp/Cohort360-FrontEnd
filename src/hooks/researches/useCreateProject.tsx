import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setProjectsList } from 'state/project'
import { ProjectType } from 'types'

const useCreateProject = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const projectsState = useAppSelector((state) => state.project)

  return useMutation({
    mutationFn: async (newProjectData: Omit<ProjectType, 'uuid'>) => await services.projects.addProject(newProjectData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projectsCount'] })
      // à supprimer après délétion du store project
      dispatch(
        setProjectsList({
          projectsList: [...projectsState.projectsList, data],
          count: projectsState.count + 1
        })
      )
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'ajout du projet" }))
    }
  })
}

export default useCreateProject
