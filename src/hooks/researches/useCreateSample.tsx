import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { CreateSampleProps } from 'services/aphp/serviceCohortCreation'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'

const useCreateSample = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newSampleData: CreateSampleProps) => await services.cohortCreation.createSample(newSampleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] })
      queryClient.invalidateQueries({ queryKey: ['samplesCount'] })
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'cohorts' })
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de la création de l'échantillon" }))
    }
  })
}

export default useCreateSample
