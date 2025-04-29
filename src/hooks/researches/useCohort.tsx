import { useEffect } from 'react'
import services from 'services/aphp'
import { useQuery } from '@tanstack/react-query'
import { setMessage } from 'state/message'
import { useAppDispatch } from 'state'

const useCohort = (cohortId?: string) => {
  const dispatch = useAppDispatch()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cohort', cohortId],
    enabled: !!cohortId,
    queryFn: async ({ queryKey, signal }: { queryKey: any; signal: AbortSignal }) => {
      const [, cohortId] = queryKey
      if (!cohortId) return null
      return await services.projects.fetchCohort(cohortId, signal)
    }
  })

  useEffect(() => {
    isError && dispatch(setMessage({ type: 'error', content: 'Erreur lors de la récupération de la cohorte' }))
  }, [isError, dispatch])

  return {
    cohort: data,
    cohortLoading: isLoading,
    cohortIsError: isError,
    error
  }
}

export default useCohort
