import { useMutation, useQueryClient } from '@tanstack/react-query'
import services from 'services/aphp'
import { RequestType } from 'types'

type MoveRequestMutation = {
  selectedRequests: RequestType[]
  parentId: string
}

const useMoveRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ selectedRequests, parentId }: MoveRequestMutation) =>
      await services.projects.moveRequests(selectedRequests, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['request'] })
    }
  })
}

export default useMoveRequest
