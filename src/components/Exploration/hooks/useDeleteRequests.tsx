import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { RequestType } from 'types'

const useDeleteRequests = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requests: RequestType[]) => await services.projects.deleteRequests(requests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    }
    // TODO: on veut quel comportement lors d'une suppression de requête via sa liste de cohorte? invalidate cohorts aussi?
    // TODO: temp, à find et delete dans le store aussi
  })
}

export default useDeleteRequests
