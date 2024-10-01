import { CanceledError } from 'axios'
import { map } from 'mappers/exploration'
import { useEffect, useState } from 'react'
import servicesCohorts from 'services/aphp/serviceCohorts'
import { CohortPMSI, CohortResults, LoadingStatus } from 'types'
import { PatientsResponse } from 'types/patient'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'

export type Data = PatientsResponse | CohortResults<CohortPMSI>

const RESULTS_PER_PAGE = 20

export const useData = (
  type: ResourceType,
  searchCriterias: SearchCriterias<Filters>,
  page: number,
  deidentified: boolean,
  groupId?: string
) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<PatientsResponse | CohortResults<CohortPMSI> | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [pagination, setPagination] = useState({ currentPage: page, total: 0 })

  const fetchData = async (page: number) => {
    console.log('test update fetching')
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const fetcher = servicesCohorts.getPatientBoardFetcher(type)
      const results = await fetcher({ page, searchCriterias, groupId })
      setData(results)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
      setData(null)
    }
  }

  useEffect(() => {
    const fetch = async () => await fetchData(1)
    fetch()
    setPagination({ ...pagination, currentPage: 1 })
  }, [searchCriterias])

  useEffect(() => {
    if (data) {
      setTableData(map(data, type, deidentified, groupId))
      setPagination({ ...pagination, total: Math.ceil(data.totalPatients / RESULTS_PER_PAGE) })
    } else setTableData({ rows: [], columns: [] })
    setLoadingStatus(LoadingStatus.SUCCESS)
  }, [data])

  const handlePage = async (page: number) => {
    await fetchData(page)
    setPagination({ ...pagination, currentPage: page })
  }

  return {
    data,
    tableData,
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
