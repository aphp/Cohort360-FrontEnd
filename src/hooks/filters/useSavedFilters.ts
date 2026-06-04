import { getConfig } from 'config'
import { mapRequestParamsToSearchCriteria } from 'mappers/filters'
import { useEffect, useState } from 'react'
import {
  getFiltersService,
  postFiltersService,
  deleteFiltersService,
  deleteFilterService,
  patchFiltersService
} from 'services/aphp/serviceFilters'
import { FetchStatus } from 'types'
import { ResourceType } from 'types/requestCriterias'
import { Filters, SavedFilter, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'

type FetchResponse = {
  status: FetchStatus
  message: string
}

export type SelectedFilter<T> = {
  filterUuid: string
  filterName: string
  filterParams: SearchCriterias<T>
}

export const useSavedFilters = (type: ResourceType) => {
  const [allSavedFilters, setAllSavedFilters] = useState<SavedFiltersResults | null>(null)
  const [fetchStatus, setFetchStatus] = useState<FetchResponse | null>(null)
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<SelectedFilter<Filters> | null>(null)

  useEffect(() => {
    getSavedFilters()
  }, [type])

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
    } catch {
      setAllSavedFilters(null)
      setFetchStatus({ status: FetchStatus.ERROR, message: 'Erreur lors de la récupération des filtres.' })
    }
  }

  const postSavedFilter = async (name: string, searchCriterias: SearchCriterias<Filters>, deidentified: boolean) => {
    try {
      await postFiltersService(type, name, searchCriterias, deidentified)
      setFetchStatus({ status: FetchStatus.SUCCESS, message: 'Le filtre a bien été enregistré.' })
      await getSavedFilters()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFetchStatus({
        status: FetchStatus.ERROR,
        message:
          error.status === 400
            ? "Erreur lors de l'enregistrement du filtre. Nom déjà existant."
            : `L'enregistrement du filtre a echoué. Veuillez réessayer ultérieurement. Si le problème persiste, veuillez contacter le support: ${
                getConfig().system.mailSupport
              }.`
      })
    }
  }

  const deleteSavedFilters = async (filtersUuids: string[]) => {
    try {
      if (filtersUuids.length > 1) await deleteFiltersService(filtersUuids)
      else await deleteFilterService(filtersUuids[0])
      await getSavedFilters()
    } catch {
      setFetchStatus({ status: FetchStatus.ERROR, message: 'Erreur lors de la suppression des filtres.' })
    }
  }

  const patchSavedFilter = async (
    name: string,
    newSearchCriterias: SearchCriterias<Filters>,
    deidentified: boolean
  ): Promise<void> => {
    if (selectedSavedFilter) {
      try {
        await patchFiltersService(type, selectedSavedFilter?.filterUuid, name, newSearchCriterias, deidentified)
        setFetchStatus({ status: FetchStatus.SUCCESS, message: 'Les modifications ont bien été enregistrées.' })
        await getSavedFilters()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setFetchStatus({
          status: FetchStatus.ERROR,
          message:
            error.status === 400
              ? "Erreur lors de l'enregistrement du filtre. Nom déjà existant."
              : `L'enregistrement du filtre a echoué. Veuillez réessayer ultérieurement. Si le problème persiste, veuillez contacter le support: ${
                  getConfig().system.mailSupport
                }.`
        })
      }
    }
  }

  const mapToSelectedFilter = async (selectedItem: SavedFilter) => {
    return {
      filterUuid: selectedItem.uuid,
      filterName: selectedItem.name,
      filterParams: await mapRequestParamsToSearchCriteria(selectedItem.filter, type)
    }
  }

  const selectFilter = (selectedFilterId: string) => {
    const selectedFilter = allSavedFilters?.results.find((elem) => elem.uuid === selectedFilterId)
    if (selectedFilter) mapToSelectedFilter(selectedFilter).then((result) => setSelectedSavedFilter(result))
    else setSelectedSavedFilter(null)
  }

  const resetFetchStatus = () => {
    setFetchStatus(null)
  }

  return {
    allSavedFilters,
    selectedSavedFilter,
    fetchStatus,
    methods: {
      next: () => getSavedFilters(allSavedFilters?.next),
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetFetchStatus,
      mapToSelectedFilter
    }
  }
}
