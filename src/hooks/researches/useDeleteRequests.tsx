import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { resetCohortCreation } from 'state/cohortCreation'
import { setMessage } from 'state/message'
import { setRequestsList } from 'state/request'
import { RequestType } from 'types'
import { deleteElements } from 'utils/explorationUtils'

const useDeleteRequests = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const requestsState = useAppSelector((state) => state.request)
  const requestId = useAppSelector((state) => state.cohortCreation.request.requestId)

  return useMutation({
    mutationFn: async (requests: RequestType[]) => await services.projects.deleteRequests(requests),
    onSuccess: (data, deletedRequests) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      dispatch(setMessage({ type: 'success', content: 'La suppression de la requête a été réalisée avec succès' }))
      // à supprimer si délétion du store request
      dispatch(
        setRequestsList({
          requestsList: deleteElements(deletedRequests, requestsState.requestsList),
          count: requestsState.count - deletedRequests.length < 0 ? 0 : requestsState.count - deletedRequests.length
        })
      )
      if (deletedRequests.some((deletedRequest) => deletedRequest.uuid === requestId)) {
        dispatch(resetCohortCreation())
      }
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors de la suppression de la requête' }))
    }
  })
}

export default useDeleteRequests
