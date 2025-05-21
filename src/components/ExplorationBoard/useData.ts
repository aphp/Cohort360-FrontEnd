import { CanceledError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { LoadingStatus } from 'types'
import { CountDisplay, Data, Diagram, ExplorationConfig, Timeline } from 'types/exploration'
import { Card } from 'types/card'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { Table } from 'types/table'
import { cancelPendingRequest } from 'utils/abortController'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'state'
import { validatePageNumber } from 'utils/url'

const RESULTS_PER_PAGE = 20

export const useData = <T>(
  config: ExplorationConfig<T>,
  searchCriterias: SearchCriterias<Filters>,
  initialPage = 1
) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)
  const currentType = useRef(config.type)
  const abortController = useRef(new AbortController())
  const [data, setData] = useState<Data | null>(null)
  const [tableData, setTableData] = useState<Table>({ rows: [], columns: [] })
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [pagination, setPagination] = useState({ currentPage: initialPage, total: 0 })
  const [count, setCount] = useState<CountDisplay | null>(null)

  const clearData = () => {
    setData(null)
    setTableData({ rows: [], columns: [] })
    setDiagrams([])
    setTimeline(null)
    setCards([])
  }

  const updateUrlWithPage = (page: number) => {
    const params = new URLSearchParams(location.search)
    params.set('page', page.toString())
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }

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
        { filters: searchCriterias.filters as T, searchBy: searchCriterias.searchBy },
        abortController.current.signal
      )
      if (currentType.current == config.type) {
        setData(results)
      }
      return results
    } catch (error) {
      if (error instanceof CanceledError) setLoadingStatus(LoadingStatus.FETCHING)
      setLoadingStatus(LoadingStatus.SUCCESS)
      setData(null)
      setCount(
        config.getCount
          ? config.getCount([
              { results: 0, total: 0 },
              { results: 0, total: 0 }
            ])
          : null
      )
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
    if (currentType.current !== config.type) {
      clearData()
      abortController.current = cancelPendingRequest(abortController.current)
    }
    currentType.current = config.type
    const fetch = async () => {
      const result = await fetchData(initialPage)
      const totalItems = result?.total ?? 0
      const totalPages = Math.ceil(totalItems / RESULTS_PER_PAGE)

      setPagination({ currentPage: initialPage, total: totalPages })

      validatePageNumber(
        initialPage,
        totalPages,
        (page) => {
          setPagination((prev) => ({ ...prev, currentPage: page }))
          updateUrlWithPage(page)
          fetchData(page)
        },
        dispatch
      )
    }
    fetch()
  }, [searchCriterias, config.type])

  const handlePage = async (page: number) => {
    await fetchData(page)
    setPagination((prev) => ({ ...prev, currentPage: page }))
    updateUrlWithPage(page)
  }

  return {
    count,
    data: { table: tableData, cards, diagrams, timeline },
    dataLoading: loadingStatus === LoadingStatus.FETCHING,
    pagination,
    onChangePage: handlePage
  }
}
