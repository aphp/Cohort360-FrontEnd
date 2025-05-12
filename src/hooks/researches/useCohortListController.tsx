import { useEffect, useMemo, useState, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

import { checkSearchParamsErrors, getCohortsSearchParams, removeFromSearchParams } from 'utils/explorationUtils'
import { removeFilter, selectFiltersAsArray } from 'utils/filters'
import { CohortsFilters, OrderBy, FilterKeys } from 'types/searchCriterias'
import { CohortsType, ExplorationsSearchParams } from 'types/cohorts'
import { ValueSet } from 'types'

type CohortListControllerParams<TItem> = {
  useData: (args: {
    orderBy: OrderBy
    searchInput: string
    filters: CohortsFilters & Record<string, unknown>
    page: number
    rowsPerPage: number
    paramsReady: boolean
  }) => { list: TItem[]; total: number; loading: boolean }
  rowsPerPage?: number
  favorites?: boolean
  simplified?: boolean
}

const useCohortListController = <TItem,>({
  useData,
  rowsPerPage = 20,
  favorites = false,
  simplified = false
}: CohortListControllerParams<TItem>) => {
  const navigate = useNavigate()
  const maintenanceIsActive = useAppSelector((s) => s?.me?.maintenance?.active ?? false)
  const appConfig = useContext(AppConfig)

  const [searchParams, setSearchParams] = useSearchParams()
  const { searchInput, startDate, endDate, page, orderBy, orderDirection, status, favorite, minPatients, maxPatients } =
    getCohortsSearchParams(searchParams)

  const [paramsReady, setParamsReady] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [filters, setFilters] = useState<CohortsFilters>({
    status,
    favorite: favorites ? [CohortsType.FAVORITE] : favorite,
    minPatients,
    maxPatients
  })
  const [openFiltersModal, setOpenFiltersModal] = useState(false)

  useEffect(() => {
    if (!simplified) {
      const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
      if (changed) setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

  const { list, total, loading } = useData({
    orderBy: order,
    searchInput,
    filters: { ...filters, startDate, endDate },
    page,
    rowsPerPage,
    paramsReady
  })

  const filtersAsArray = useMemo(
    () => selectFiltersAsArray({ status, favorite, minPatients, maxPatients, startDate, endDate }),
    [status, favorite, minPatients, maxPatients, startDate, endDate]
  )

  const handlePageChange = (newPage: number) => {
    searchParams.set(ExplorationsSearchParams.PAGE, String(newPage))
    setSearchParams(searchParams)
  }

  const changeOrderBy = (newOrder: OrderBy) => {
    setOrder(newOrder)
    searchParams.set(ExplorationsSearchParams.ORDER_BY, newOrder.orderBy)
    searchParams.set(ExplorationsSearchParams.DIRECTION, newOrder.orderDirection)
    setSearchParams(searchParams)
  }

  const removeFilterChip = (key: FilterKeys, value: string) => {
    removeFromSearchParams(searchParams, setSearchParams, key, value)
    setFilters(removeFilter(key, value, filters))
  }

  const applyFilters = (newFilters: CohortsFilters) => {
    setFilters({ ...filters, ...newFilters })
    if (!simplified) {
      newFilters.status.length > 0 &&
        searchParams.set(ExplorationsSearchParams.STATUS, newFilters.status.map((s: ValueSet) => s.code).join())
      newFilters.favorite.length > 0 && searchParams.set(ExplorationsSearchParams.FAVORITE, newFilters.favorite.join())
      newFilters.minPatients && searchParams.set(ExplorationsSearchParams.MIN_PATIENTS, newFilters.minPatients)
      newFilters.maxPatients && searchParams.set(ExplorationsSearchParams.MAX_PATIENTS, newFilters.maxPatients)
      setSearchParams(searchParams)
    }
  }

  return {
    appConfig,
    applyFilters,
    changeOrderBy,
    filters,
    filtersAsArray,
    handlePageChange,
    list,
    loading,
    maintenanceIsActive,
    navigate,
    openFiltersModal,
    order,
    page,
    removeFilterChip,
    setOrder,
    setOpenFiltersModal,
    total
  }
}

export default useCohortListController
