import { CanceledError } from 'axios'
import { useCallback, useRef, useState } from 'react'
import { LoadingStatus } from 'types'
import { CountDisplay, Data, Diagram, ExplorationConfig, Timeline } from 'types/exploration'
import { Card } from 'types/card'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'

export const RESULTS_PER_PAGE = 20

export const useData = <T>(/*config: ExplorationConfig<T>*/) => {
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const abortController = useRef(new AbortController())
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [count, setCount] = useState<CountDisplay | null>(null)

  const clearData = () => {
    setTableData({ rows: [], columns: [] })
    setDiagrams([])
    setTimeline(null)
    setCards([])
    setCount(null)
  }

  const mapData = useCallback(
    (data: Data | null, config: ExplorationConfig<T>, searchCriterias: SearchCriterias<Filters>) => {
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
          setCount(count)
        } else setCount(null)
      } else {
        clearData()
        setCount(null)
      }
    },
    []
  )

  const fetchData = async (page: number, searchCriterias: SearchCriterias<Filters>, config: ExplorationConfig<T>) => {
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
        { filters: searchCriterias.filters as T, searchBy: searchCriterias.searchBy },
        abortController.current.signal
      )
      mapData(results, config, searchCriterias)
      return results.total
    } catch (error) {
      if (error instanceof CanceledError) setLoadingStatus(LoadingStatus.FETCHING)
      mapData(null, config, searchCriterias)
      return 0
    } finally {
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  return {
    count,
    data: { table: tableData, cards, diagrams, timeline },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    fetch: fetchData
  }
}
