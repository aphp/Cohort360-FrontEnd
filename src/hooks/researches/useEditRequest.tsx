import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { setMessage } from 'state/message'
import { setRequestsList } from 'state/request'
import { RequestType } from 'types'
import { replaceItem } from 'utils/explorationUtils'

const useEditRequest = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const requestsState = useAppSelector((state) => state.request)

  return useMutation({
    mutationFn: async (newRequestData: RequestType) => await services.projects.editRequest(newRequestData),
    onSuccess: (data, editedRequest) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
      dispatch(setMessage({ type: 'success', content: "L'édition de la requête a été réalisée avec succès" }))
      // à supprimer si délétion du store request
      dispatch(
        setRequestsList({
          requestsList: replaceItem(editedRequest, requestsState.requestsList)
        })
      )
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition de la requête" }))
    }
  })
}

export default useEditRequest
