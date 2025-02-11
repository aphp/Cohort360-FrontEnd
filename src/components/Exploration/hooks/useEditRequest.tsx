import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { RequestType } from 'types'

const useEditRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRequestData: RequestType) => await services.projects.editRequest(newRequestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
    }
  })
  // TODO: temp, à find et éditer dans le store aussi
}

export default useEditRequest
