import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { useAppDispatch } from 'state'
import { setMessage } from 'state/message'
import { RequestType } from 'types'

const useEditRequest = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRequestData: RequestType) => await services.projects.editRequest(newRequestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
      dispatch(setMessage({ type: 'success', content: "L'édition de la requête a été réalisée avec succès" }))
    },
    onError: () => {
      dispatch(setMessage({ type: 'error', content: "Erreur lors de l'édition de la requête" }))
    }
  })
  // TODO: à find et éditer dans le store aussi
}

export default useEditRequest
