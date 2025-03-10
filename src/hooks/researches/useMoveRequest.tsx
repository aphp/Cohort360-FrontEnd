import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setRequestsList } from 'state/request'
import { ProjectType, RequestType } from 'types'
import { replaceParentFolder } from 'utils/explorationUtils'

type MoveRequestMutation = {
  selectedRequests: RequestType[]
  parent: ProjectType
}

const useMoveRequest = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const requestsState = useAppSelector((state) => state.request)

  return useMutation({
    mutationFn: async ({ selectedRequests, parent }: MoveRequestMutation) =>
      await services.projects.moveRequests(selectedRequests, parent.uuid),
    onSuccess: (data, { selectedRequests, parent }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
      dispatch(setMessage({ type: 'success', content: 'La ou les requêtes ont été déplacées avec succès' }))
      // à supprimer si délétion du store request
      dispatch(
        setRequestsList({ requestsList: replaceParentFolder(selectedRequests, requestsState.requestsList, parent) })
      )
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: 'Erreur lors du déplacement de requête' }))
    }
  })
}

export default useMoveRequest
