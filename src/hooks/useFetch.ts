import { useEffect, useState } from 'react'
import { Back_API_Response, LoadingStatus } from 'types'
import { isAxiosError } from 'axios'

type FetchOptions = {
  searchInput?: string
  limit?: number
  page?: number
}

export const useFetch = <T>(fetchCall: () => Promise<Back_API_Response<T>>, options?: FetchOptions) => {
  const [response, setResponse] = useState<Back_API_Response<T>>({
    count: 0,
    next: '',
    previous: '',
    results: []
  })
  const [error, setError] = useState('')
  const [fetchStatus, setFetchStatus] = useState(LoadingStatus.IDDLE)

  useEffect(() => {
    setFetchStatus(LoadingStatus.FETCHING)
  }, [options])

  useEffect(() => {
    const handleFetchCall = async () => {
      setFetchStatus(LoadingStatus.FETCHING)
      const response = await fetchCall()
      if (isAxiosError(response)) {
        setError(response.message)
      }
      setFetchStatus(LoadingStatus.SUCCESS)
      setResponse(response)
    }
    if (fetchStatus === LoadingStatus.FETCHING) {
      handleFetchCall()
    }
  }, [fetchStatus])

  return {
    response,
    error,
    fetchStatus
  }
}
