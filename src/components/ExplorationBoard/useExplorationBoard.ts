import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import { useEffect, useMemo, useState } from 'react'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { AdditionalInfo, SearchWithFilters } from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import { FilterKeys, FilterValue, Filters, SearchCriteriaKeys, SearchCriterias } from 'types/searchCriterias'
import { narrowSearchCriterias } from 'utils/exploration'
import { selectFiltersAsArray } from 'utils/filters'
import { getInitSearchCriterias, getSourceType, getReferences, fetchAdditionalInfos } from './config/config'

export const useExplorationBoard = (type: ResourceType, deidentified: boolean, isPatient: boolean, search?: string) => {
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo>({ type, deidentified })
  const init = useMemo(() => getInitSearchCriterias(type, search), [type, search])
  const [
    searchCriterias,
    { changeSearchBy, changeOrderBy, changeSearchInput, addFilters, removeFilter, removeSearchCriterias }
  ] = useSearchCriterias<Filters>(init)

  const {
    allSavedFilters,
    fetchStatus,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetFetchStatus }
  } = useSavedFilters<Filters>(type)
  const references = useMemo(() => getReferences(type), [type])
  const sourceType = useMemo(() => getSourceType(type), [type])

  const narrowedSearchCriterias = useMemo(
    () => narrowSearchCriterias(deidentified, searchCriterias, type, isPatient),
    [searchCriterias]
  )

  const narrowedSelectedFilter = useMemo(() => {
    if (selectedSavedFilter)
      return {
        ...selectedSavedFilter,
        filterParams: narrowSearchCriterias(deidentified, selectedSavedFilter.filterParams, type, isPatient)
      }
    else return null
  }, [selectedSavedFilter])

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

  const fetchInfos = async () => {
    const newInfo = await fetchAdditionalInfos(type, deidentified, additionalInfo)
    setAdditionalInfo((prev) => ({ ...prev, ...newInfo, references, sourceType, type }))
  }

  useEffect(() => {
    removeSearchCriterias()
    fetchInfos()
  }, [type, deidentified, search])

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
        patchSavedFilter(name, searchCriterias, deidentified),
      onSubmit: onSaveSearchCriterias
    },
    fetchStatus,
    additionalInfo,
    searchCriterias: narrowedSearchCriterias,
    criterias,
    onSearch: onSaveSearchCriterias,
    onSaveFilter: (name: string) => postSavedFilter(name, narrowedSearchCriterias, deidentified),
    onSort: changeOrderBy,
    onRemoveCriteria,
    resetFetchStatus
  }
}
