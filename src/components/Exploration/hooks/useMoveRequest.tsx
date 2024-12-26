import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { RequestType } from 'types'

type MoveRequestMutation = {
  selectedRequests: RequestType[]
  parentId: string
}

const useMoveRequest = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ selectedRequests, parentId }: MoveRequestMutation) =>
      await services.projects.moveRequests(selectedRequests, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
      dispatch(setMessage({ type: 'success', content: 'La ou les requêtes ont été déplacées avec succès' }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors du déplacement de requête' }))
    }
  })
}

export default useMoveRequest
