import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { Cohort } from 'types'

const useEditCohort = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newCohortData: Cohort) => await services.projects.editCohort(newCohortData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cohorts'] })
    }
  })
}

export default useEditCohort
