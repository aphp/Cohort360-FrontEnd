import { CanceledError } from 'axios'
import { useEffect, useState } from 'react'
import { LoadingStatus } from 'types'
import { CountDisplay, Data, Diagram, ExplorationConfig, Timeline } from 'types/exploration'
import { Card } from 'types/card'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'

const RESULTS_PER_PAGE = 20

export const useData = <T>(config: ExplorationConfig<T>, searchCriterias: SearchCriterias<Filters>) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [pagination, setPagination] = useState({ currentPage: 0, total: 0 })
  const [count, setCount] = useState<CountDisplay | null>(null)

  const fetchData = async (page: number) => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const results = await config.fetchList(
        {
          size: RESULTS_PER_PAGE,
          page,
          includeFacets: true,
          searchInput: searchCriterias.searchInput ?? '',
          orderBy: searchCriterias.orderBy
        },
        { filters: searchCriterias.filters as T, searchBy: searchCriterias.searchBy }
      )
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
        config.hasSearchDisplay && config.hasSearchDisplay(searchCriterias.searchInput, searchCriterias.searchBy)
      if (config.mapToTimeline) config.mapToTimeline(data).then(setTimeline)
      else setTimeline(null)
      if (config.mapToDiagram && data.meta) setDiagrams(config.mapToDiagram(data.meta))
      else setDiagrams([])
      if (config.mapToTable) setTableData(config.mapToTable(data, hasSearch))
      else setTableData({ rows: [], columns: [] })
      if (config.mapToCards) setCards(config.mapToCards(data))
      else setCards([])
      if (config.getCount) {
        const count = config.getCount([
          { results: data.total, total: data.totalAllResults },
          { results: data.totalPatients, total: data.totalAllPatients }
        ])
        setPagination({
          ...pagination,
          total: Math.ceil(count[0].count.results / RESULTS_PER_PAGE)
        })
        setCount(count)
      } else setCount(null)
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
    data: { table: tableData, cards, diagrams, timeline },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
