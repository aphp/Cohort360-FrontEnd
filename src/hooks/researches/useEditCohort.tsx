import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { Cohort } from 'types'

const useEditCohort = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCohortData: Cohort) => await services.projects.editCohort(newCohortData),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'cohorts' })
      queryClient.invalidateQueries({ queryKey: ['cohort'] })
      dispatch(setMessage({ type: 'success', content: "L'édition de la cohorte a été réalisée avec succès" }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition de la cohorte" }))
    }
  })
}

export default useEditCohort
