import { CanceledError } from 'axios'
import { useEffect, useState } from 'react'
import servicesCohorts from 'services/aphp/serviceCohorts'
import { LoadingStatus } from 'types'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchCriterias } from 'types/searchCriterias'

export const useData = (type: ResourceType, searchCriterias: SearchCriterias<Filters>, page: number) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<any | null>(null)

  const fetchData = async (searchCriterias: SearchCriterias<Filters>, page: number) => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const fetcher = servicesCohorts.getPatientBoardFetcher(type)
      const results = await fetcher({ page, searchCriterias })
      setData(results)
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  useEffect(() => {
    const fetch = async () => await fetchData(searchCriterias, page)
     fetch()
  }, [searchCriterias, page])

  return {
    data,
    loadingStatus
  }
}
