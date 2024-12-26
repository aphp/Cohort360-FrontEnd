import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { Cohort } from 'types'

const useDeleteCohort = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cohorts: Cohort[]) => await services.projects.deleteCohorts(cohorts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] })
      dispatch(setMessage({ type: 'success', content: 'La suppression de la cohorte a été réalisée avec succès' }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la suppression de la cohorte' }))
    }
  })
}

export default useDeleteCohort
