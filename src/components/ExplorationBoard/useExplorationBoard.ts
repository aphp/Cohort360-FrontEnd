import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useState } from 'react'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { AdditionalInfo, ExplorationConfig, SearchWithFilters } from 'types/exploration'
import { FilterKeys, FilterValue, Filters, SearchCriteriaKeys, SearchCriterias } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'

export const useExplorationBoard = <T>(config: ExplorationConfig<T>) => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({ type: config.type, deidentified: false })
  const [searchCriterias, { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter }] =
    useSearchCriterias(config.initSearchCriterias(), config.type)

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters(config.type)

  const narrowSearch = useMemo(() => config.narrowSearchCriterias, [config])

  const narrowedSearchCriterias = useMemo(() => narrowSearch(searchCriterias as SearchCriterias<T>), [searchCriterias])

  const narrowedSelectedFilter = useMemo(
    () =>
      selectedSavedFilter
        ? {
            ...selectedSavedFilter,
            filterParams: narrowSearch(selectedSavedFilter.filterParams as SearchCriterias<T>)
          }
        : null,
    [selectedSavedFilter]
  )

  const criterias = useMemo(() => {
    return narrowedSearchCriterias.filters || narrowedSearchCriterias.searchInput
      ? selectFiltersAsArray(narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput)
      : []
  }, [narrowedSearchCriterias.filters, narrowedSearchCriterias.searchInput])

  const onRemoveCriteria = (category: FilterKeys | SearchCriteriaKeys, value: FilterValue) => {
    if (category === SearchCriteriaKeys.SEARCH_INPUT) changeSearchInput('')
    else removeFilter(category as FilterKeys, value)
  }

  const onSaveSearchCriterias = ({ searchBy, searchInput, filters, orderBy }: SearchWithFilters) => {
    if (searchBy) changeSearchBy(searchBy)
    if (searchInput !== undefined) changeSearchInput(searchInput)
    if (filters) addFilters(filters)
    if (orderBy) changeOrderBy(orderBy)
  }

  useEffect(() => {
    const fetchInfos = async () => {
      const newInfo = await config.fetchAdditionalInfos(additionalInfo)
      setAdditionalInfo({ ...additionalInfo, ...newInfo, type: config.type })
    }
    fetchInfos()
  }, [config.type])

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
