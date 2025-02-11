import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { Cohort } from 'types'

const useDeleteCohort = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cohorts: Cohort[]) => await services.projects.deleteCohort(cohorts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] })
    }
  })
}

export default useDeleteCohort
