import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'

const useRequest = (requestId?: string) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['request', requestId],
    enabled: !!requestId, // ça veut dire qu'on fait pas l'appel si pas de requestId
    queryFn: async () => {
      if (!requestId) return null
      const requestData = await services.projects.fetchRequest(requestId)
      return requestData
    }
  })

  return {
    request: data,
    requestLoading: isLoading,
    requestIsError: isError,
    error,
    refetch
  }
}

export default useRequest
