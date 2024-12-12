import { useMemo, useState } from 'react'
import { SearchCriterias } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'

export const usePatientBoard = <T>() => {
  const [searchCriterias, setSearchCriterias] = useState<SearchCriterias<T>>()

  const criterias = useMemo(() => {
    return searchCriterias?.filters ? selectFiltersAsArray(searchCriterias.filters) : []
  }, [searchCriterias])

  const onSaveSearchCriterias = (searchCriterias: SearchCriterias<T>) => {
    setSearchCriterias(searchCriterias)
  }

  return {
    searchCriterias,
    criterias,
    onSaveSearchCriterias
  }
}
