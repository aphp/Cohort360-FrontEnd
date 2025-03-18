import { useEffect } from 'react'
import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'
import { setMessage } from 'state/message'
import { useAppDispatch } from 'state'

const useRequest = (requestId?: string) => {
  const dispatch = useAppDispatch()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['request', requestId],
    enabled: !!requestId, // ça veut dire qu'on fait pas l'appel si pas de requestId
    queryFn: async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
      const [, requestId] = queryKey
      if (!requestId) return null
      const requestData = await services.projects.fetchRequest(requestId, signal)
      return requestData
    }
  })

  useEffect(() => {
    isError && dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération de la requête' }))
  }, [isError, dispatch])

  return {
    request: data,
    requestLoading: isLoading,
    requestIsError: isError,
    error,
    refetch
  }
}

export default useRequest
