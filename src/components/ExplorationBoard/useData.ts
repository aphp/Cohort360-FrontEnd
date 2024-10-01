import { CanceledError } from 'axios'
import { mapToTable, mapToCards } from 'mappers/exploration'
import { useEffect, useState } from 'react'
import { PatientState } from 'state/patient'
import { LoadingStatus } from 'types'
import { Data, DATA_DISPLAY, ExplorationCount } from 'types/exploration'
import { Card } from 'types/card'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'
import { isPatientsResponse } from 'utils/exploration'
import { getExplorationFetcher } from './config/config'

const RESULTS_PER_PAGE = 20

export const useData = (
  type: ResourceType,
  display: DATA_DISPLAY,
  searchCriterias: SearchCriterias<Filters>,
  deidentified: boolean,
  groupId: string[],
  patient?: PatientState
) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [cards, setCards] = useState<Card[]>([])
  const [pagination, setPagination] = useState({ currentPage: 0, total: 0 })
  const [count, setCount] = useState<ExplorationCount>({ patients: null, ressource: null })

  const fetchData = async (page: number) => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const results = await getExplorationFetcher(type)({
        page,
        searchCriterias,
        deidentified,
        type,
        groupId,
        patient,
        includeFacets: true
      })
      setData(results)
    } catch (error) {
      if (error instanceof CanceledError) setLoadingStatus(LoadingStatus.FETCHING)
      setLoadingStatus(LoadingStatus.SUCCESS)
      setData(null)
    }
  }

  useEffect(() => {
    if (data) {
      const hasSearch =
        type === ResourceType.DOCUMENTS &&
        !!searchCriterias.searchInput &&
        searchCriterias.searchBy === SearchByTypes.TEXT
      if (display === DATA_DISPLAY.TABLE)
        setTableData(mapToTable(data, type, deidentified, !!patient, groupId, hasSearch))
      if (display === DATA_DISPLAY.INFO) setCards(mapToCards(data, deidentified, groupId))
      const patients =
        !patient && data.totalPatients ? { results: data.totalPatients, total: data.totalAllPatients } : null
      const ressource =
        !isPatientsResponse(data) && data.total ? { results: data.total, total: data.totalAllResults } : null
      setPagination({
        ...pagination,
        total: Math.ceil((ressource?.results ?? patients?.results ?? 0) / RESULTS_PER_PAGE)
      })
      setCount({ patients, ressource })
    } else {
      setTableData({ rows: [], columns: [] })
      setCards([])
      setCount({ patients: null, ressource: null })
      setCount({ patients: null, ressource: null })
    }
    setLoadingStatus(LoadingStatus.SUCCESS)
  }, [data])

  useEffect(() => {
    const fetch = async () => await fetchData(1)
    fetch()
    setPagination({ ...pagination, currentPage: 1 })
  }, [searchCriterias])

  const handlePage = async (page: number) => {
    await fetchData(page)
    setPagination({ ...pagination, currentPage: page })
  }

  return {
    count,
    data: { raw: data, table: tableData, cards },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
