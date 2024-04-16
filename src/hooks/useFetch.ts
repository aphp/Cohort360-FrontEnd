import { useEffect, useState } from 'react'
import { Back_API_Response, LoadingStatus } from 'types'
import { isAxiosError } from 'axios'

type FetchOptions = {
  searchInput?: string
  limit?: number
  page?: number
}

export const useFetch = <T>(options: FetchOptions, fetchCall: () => Promise<Back_API_Response<T>>) => {
  const [response, setResponse] = useState<Back_API_Response<T>>({
    count: 0,
    next: '',
    previous: '',
    results: []
  })
  const [error, setError] = useState('')
  const [fetchStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)

  const handleFetchCall = async () => {
    const response = await fetchCall()
    if (isAxiosError(response)) {
      setError(response.message)
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
    setResponse(response)
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.FETCHING)
  }, [options])

  useEffect(() => {
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
