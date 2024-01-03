import { mapRequestParamsToSearchCriteria } from 'mappers/filters'
import { useState } from 'react'
import {
  deleteFiltersService,
  getFiltersService,
  patchFiltersService,
  postFiltersService
} from 'services/aphp/servicePatients'
import { ErrorType } from 'types/error'
import { RessourceType } from 'types/requestCriterias'
import { Filters, SavedFilter, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'

export type SelectedFilter<T> = {
  filterUuid: string
  filterName: string
  filterParams: SearchCriterias<T>
}

export const useSavedFilters = <T>(type: RessourceType) => {
  const [allSavedFilters, setAllSavedFilters] = useState<SavedFiltersResults | null>(null)
  const [savedFiltersErrors, setSavedFiltersErrors] = useState<ErrorType>({ isError: false })
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<SelectedFilter<T> | null>(null)

  const getSavedFilters = async (next?: string | null) => {
    try {
      const response = await getFiltersService(type, next)
      if (next) {
        setAllSavedFilters({
          ...response,
          results: [...(allSavedFilters?.results || []), ...response.results]
        } as SavedFiltersResults)
      } else {
        setAllSavedFilters(response)
      }
    } catch (err) {
      setAllSavedFilters(null)
    }
  }

  const postSavedFilter = async (name: string, searchCriterias: SearchCriterias<Filters>, deidentified: boolean) => {
    try {
      await postFiltersService(type, name, searchCriterias, deidentified)
      setSavedFiltersErrors({ isError: false })
      await getSavedFilters()
    } catch {
      setSavedFiltersErrors({ isError: true, errorMessage: 'Nom déjà existant.' })
      throw 'Nom déjà existant'
    }
  }

  const deleteSavedFilters = async (filtersUuids: string[]) => {
    await deleteFiltersService(filtersUuids)
    await getSavedFilters()
  }

  const patchSavedFilter = async (
    name: string,
    newSearchCriterias: SearchCriterias<Filters>,
    deidentified: boolean
  ): Promise<void> => {
    if (selectedSavedFilter) {
      await patchFiltersService(type, selectedSavedFilter?.filterUuid, name, newSearchCriterias, deidentified)
      await getSavedFilters()
    }
  }

  const mapToSelectedFilter = (selectedItem: SavedFilter) => {
    return {
      filterUuid: selectedItem.uuid,
      filterName: selectedItem.name,
      filterParams: mapRequestParamsToSearchCriteria(selectedItem.filter, type) as SearchCriterias<T>
    }
  }

  const selectFilter = (selectedFilter: SelectedFilter<T>) => {
    setSelectedSavedFilter(selectedFilter)
  }

  const resetSavedFilterError = () => {
    setSavedFiltersErrors({ isError: false })
  }

  return {
    allSavedFilters,
    selectedSavedFilter,
    savedFiltersErrors,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      mapToSelectedFilter,
      resetSavedFilterError
    }
  }
}
