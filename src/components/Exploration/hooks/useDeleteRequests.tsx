import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { RequestType } from 'types'

const useDeleteRequests = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requests: RequestType[]) => await services.projects.deleteRequests(requests),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      dispatch(setMessage({ type: 'success', content: 'La suppression de la requête a été réalisée avec succès' }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la suppression de la requête' }))
    }
    // TODO: temp, à find et delete dans le store aussi
  })
}

export default useDeleteRequests
