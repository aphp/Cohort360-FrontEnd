import { useMemo } from 'react'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { Filters, SearchCriterias } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'

export const usePatientBoard = () => {
  const [{ searchBy, orderBy, searchInput, filters }, { changeSearchBy, changeSearchInput, addFilters, removeFilter }] =
    useSearchCriterias(initPatientsSearchCriterias)

  const criterias = useMemo(() => {
    return filters ? selectFiltersAsArray(filters) : []
  }, [filters])

  const onSaveSearchCriterias = ({ searchBy, searchInput, filters }: SearchCriterias<Filters>) => {
    if (searchBy) changeSearchBy(searchBy)
    if (searchInput) changeSearchInput(searchInput)
    if (filters) addFilters(filters)
  }

  return {
    searchCriterias: { orderBy, searchBy, searchInput, filters },
    criterias,
    onSaveSearchCriterias,
    removeFilter
  }
}
