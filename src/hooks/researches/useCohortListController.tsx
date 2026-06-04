import { useEffect, useMemo, useState, useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppSelector } from 'state'
import { AppConfig } from 'config'

import { checkSearchParamsErrors, getCohortsSearchParams, removeFromSearchParams } from 'utils/explorationUtils'
import { selectFiltersAsArray } from 'utils/filters'
import { CohortsFilters, OrderBy, FilterKeys } from 'types/searchCriterias'
import { CohortsType, ExplorationsSearchParams } from 'types/cohorts'

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
  const { searchInput, page, orderBy, orderDirection, filters } = useMemo(() => {
    const { searchInput, page, orderBy, filters } = getCohortsSearchParams(searchParams)
    return {
      searchInput,
      page,
      orderBy: orderBy.orderBy,
      orderDirection: orderBy.orderDirection,
      filters: { ...filters, favorite: favorites ? [CohortsType.FAVORITE] : filters.favorite }
    }
  }, [searchParams, favorites])

  const [paramsReady, setParamsReady] = useState(false)
  const [order, setOrder] = useState<OrderBy>({ orderBy, orderDirection })
  const [form, setForm] = useState<CohortsFilters>(filters)
  const [openFiltersModal, setOpenFiltersModal] = useState(false)
  const [modalError, setModalError] = useState(false)

  useEffect(() => {
    if (!simplified) {
      const { changed, newSearchParams } = checkSearchParamsErrors(searchParams)
      if (changed) setSearchParams(newSearchParams)
    }
    setParamsReady(true)
  }, [])

  const { list, total, loading } = useData({
    orderBy: order,
    searchInput: searchInput ?? '',
    filters,
    page,
    rowsPerPage,
    paramsReady
  })

  const filtersAsArray = useMemo(() => selectFiltersAsArray(filters, undefined), [filters])

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
  }

  const applyFilters = (newFilters: CohortsFilters) => {
    if (!simplified) {
      if (newFilters.status.length > 0) {
        searchParams.set(ExplorationsSearchParams.STATUS, newFilters.status.map((status) => status.id).join())
      } else {
        searchParams.delete(ExplorationsSearchParams.STATUS)
      }
      if (newFilters.favorite.length > 0) {
        searchParams.set(ExplorationsSearchParams.FAVORITE, newFilters.favorite.join())
      } else {
        searchParams.delete(ExplorationsSearchParams.FAVORITE)
      }
      if (newFilters.minPatients) {
        searchParams.set(ExplorationsSearchParams.MIN_PATIENTS, newFilters.minPatients)
      } else {
        searchParams.delete(ExplorationsSearchParams.MIN_PATIENTS)
      }
      if (newFilters.maxPatients) {
        searchParams.set(ExplorationsSearchParams.MAX_PATIENTS, newFilters.maxPatients)
      } else {
        searchParams.delete(ExplorationsSearchParams.MAX_PATIENTS)
      }
      setSearchParams(searchParams)
      setOpenFiltersModal(false)
    }
  }

  return {
    appConfig,
    applyFilters,
    changeOrderBy,
    form,
    setForm,
    filtersAsArray,
    handlePageChange,
    list,
    loading,
    maintenanceIsActive,
    modalError,
    setModalError,
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
