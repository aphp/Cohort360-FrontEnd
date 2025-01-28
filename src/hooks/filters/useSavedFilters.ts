import { Item } from 'components/ui/List/ListItem'
import { mapRequestParamsToSearchCriteria } from 'mappers/filters'
import { useEffect, useState } from 'react'
import {
  deleteFiltersService,
  getFiltersService,
  patchFiltersService,
  postFiltersService
} from 'services/aphp/servicePatients'
import { ErrorType } from 'types/error'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SavedFilter, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'

export type SelectedFilter<T> = {
  filterUuid: string
  filterName: string
  filterParams: SearchCriterias<T>
}

export const useSavedFilters = <T>(type: ResourceType) => {
  const [allSavedFilters, setAllSavedFilters] = useState<SavedFiltersResults | null>(null)
  const [allSavedFiltersAsListItems, setAllSavedFiltersAsListItems] = useState<Item[]>([])
  const [savedFiltersErrors, setSavedFiltersErrors] = useState<ErrorType>({ isError: false })
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<SelectedFilter<T> | null>(null)

  useEffect(() => {
    getSavedFilters()
  }, [type])

  useEffect(
    () =>
      setAllSavedFiltersAsListItems(
        allSavedFilters?.results.map((elem) => {
          return { id: elem.uuid, name: elem.name, checked: false }
        }) || []
      ),
    [allSavedFilters]
  )

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
      setSavedFiltersErrors({
        isError: true,
        errorMessage: "Il y a eu une erreur lors de l'enregistrement du filtre. Vérifiez que le nom n'existe pas déjà."
      })
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

  const mapToSelectedFilter = async (selectedItem: SavedFilter) => {
    return {
      filterUuid: selectedItem.uuid,
      filterName: selectedItem.name,
      filterParams: (await mapRequestParamsToSearchCriteria(selectedItem.filter, type)) as SearchCriterias<T>
    }
  }

  const selectFilter = (selectedFilterId: string) => {
    const selectedFilter = allSavedFilters?.results.find((elem) => elem.uuid === selectedFilterId)
    if (selectedFilter) mapToSelectedFilter(selectedFilter).then((result) => setSelectedSavedFilter(result))
    else setSelectedSavedFilter(null)
  }

  const resetSavedFilterError = () => {
    setSavedFiltersErrors({ isError: false })
  }

  return {
    allSavedFilters,
    allSavedFiltersAsListItems,
    selectedSavedFilter,
    savedFiltersErrors,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetSavedFilterError,
      mapToSelectedFilter
    }
  }
}
