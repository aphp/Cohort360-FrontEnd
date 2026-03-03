import { usePagination } from 'components/ui/Pagination/usePagination'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { AdditionalInfo, ExplorationConfig, SearchWithFilters } from 'types/exploration'
import { FilterKeys, FilterValue, Filters, SearchCriteriaKeys, SearchCriterias } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import { useData } from './useData'

export const useExplorationBoard = <T>(config: ExplorationConfig<T>) => {
  const prevTypeRef = useRef(config.type)

  const [searchCriterias, { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter }] =
    useSearchCriterias(config.initSearchCriterias(), config.type)
  const { count, data, dataLoading, fetchData } = useData(config)
  const { pagination, onChangePage, onChangeTotal } = usePagination()

  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({ type: config.type, deidentified: false })
  const additionalInfoRef = useRef(additionalInfo)
  additionalInfoRef.current = additionalInfo

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters(config.type)

  const narrowSearch = useMemo(() => config.narrowSearchCriterias, [config])

  const narrowedSearchCriterias = useMemo(
    () => narrowSearch(searchCriterias as SearchCriterias<T>),
    [searchCriterias, narrowSearch]
  )

  useEffect(() => {
    let cancelled = false

    const runFetch = async () => {
      const results = await fetchData(pagination.currentPage, narrowedSearchCriterias)
      if (!cancelled) onChangeTotal(results?.total ?? 0)
    }

    if (prevTypeRef.current !== config.type) {
      onChangePage(1)
      prevTypeRef.current = config.type
    } else runFetch()

    return () => {
      cancelled = true
    }
  }, [pagination.currentPage, narrowedSearchCriterias, config.type])

  const narrowedSelectedFilter = useMemo(
    () =>
      selectedSavedFilter
        ? {
            ...selectedSavedFilter,
            filterParams: narrowSearch(selectedSavedFilter.filterParams as SearchCriterias<T>)
          }
        : null,
    [selectedSavedFilter, narrowSearch]
  )

  const criterias = useMemo(() => {
    return narrowedSearchCriterias.filters || narrowedSearchCriterias.searchInput
      ? selectFiltersAsArray(narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput)
      : []
  }, [narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput])

  const onRemoveCriteria = (category: FilterKeys | SearchCriteriaKeys, value: FilterValue) => {
    if (category === SearchCriteriaKeys.SEARCH_INPUT) changeSearchInput('')
    else removeFilter(category as FilterKeys, value)
    onChangePage(1)
  }

  const onSaveSearchCriterias = ({ searchBy, searchInput, filters, orderBy }: SearchWithFilters) => {
    if (searchBy) changeSearchBy(searchBy)
    if (searchInput !== undefined) changeSearchInput(searchInput)
    if (filters) addFilters(filters)
    if (orderBy) changeOrderBy(orderBy)
    onChangePage(1)
  }

  useEffect(() => {
    const fetch = async () => {
      const newInfo = await config.fetchAdditionalInfos(additionalInfoRef.current)
      setAdditionalInfo((prev) => ({ ...prev, ...newInfo, type: config.type }))
    }
    fetch()
  }, [config])

  return {
    savedFiltersData: {
      allFilters: allSavedFilters,
      selectedFilter: narrowedSelectedFilter
    },
    savedFiltersActions: {
      onNext: next,
      onSelect: selectFilter,
      onDelete: deleteSavedFilters,
      onEdit: (name: string, searchCriterias: SearchCriterias<Filters>) =>
        patchSavedFilter(name, searchCriterias, config.deidentified),
      onSubmit: onSaveSearchCriterias
    },
    data: {
      data,
      dataLoading,
      count
    },
    page: {
      pagination,
      onChangePage
    },
    fetchStatus,
    additionalInfo,
    searchCriterias: narrowedSearchCriterias,
    criterias,
    onSearch: onSaveSearchCriterias,
    onSaveFilter: (name: string) => postSavedFilter(name, narrowedSearchCriterias, config.deidentified),
    onSort: changeOrderBy,
    onRemoveCriteria,
    resetFetchStatus
  }
}
