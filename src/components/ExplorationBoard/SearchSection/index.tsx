import React from 'react'
import { Grid } from '@mui/material'
import FilterBy from './FilterBy'
import OccurrencesSearch from './OccurrenceSearch'
import { Filters, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'
import { AdditionalInfo, Search, SearchWithFilters } from '../useExplorationBoard'
import SavedFilters from './SavedFilters'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'

type SavedFiltersActions = {
  onNext: () => void
  onSelect: (selectedFilterId: string) => void
  onDelete: (filtersUuids: string[]) => void
  onEdit: (name: string, newSearchCriterias: SearchCriterias<Filters>) => void
  onSubmit: (criterias: SearchCriterias<Filters>) => void
}

type SavedFiltersData<T> = {
  allFilters: SavedFiltersResults | null
  selectedFilter: SelectedFilter<T> | null
}

type SearchSectionProps = {
  deidentified: boolean
  searchCriterias: SearchCriterias<Filters>
  infos: AdditionalInfo
  savedFiltersActions: SavedFiltersActions
  savedFiltersData: SavedFiltersData<Filters>
  onSearch: (search: SearchWithFilters) => void
}

const SearchSection = ({
  deidentified,
  searchCriterias,
  infos,
  savedFiltersActions,
  savedFiltersData,
  onSearch
}: SearchSectionProps) => {
  const handleChangeFields = (search: Search) => {
    if (search.searchBy !== searchCriterias.searchBy) onSearch({ searchBy: search.searchBy })
    if (search.searchInput !== searchCriterias.searchInput) onSearch({ searchInput: search.searchInput })
  }

  return (
    <Grid container justifyContent="space-between">
      <Grid container item xs={12} sm={6} lg={8}>
        <OccurrencesSearch search={searchCriterias} onChange={handleChangeFields} />
      </Grid>
      <Grid container item xs={12} sm={5} lg={4} gap={1} justifyContent="flex-end">
        <Grid container item xs={12} md={5}>
          <FilterBy
            infos={infos}
            deidentified={deidentified}
            filters={searchCriterias.filters as Filters}
            onSubmit={(newFilters) => onSearch({ filters: newFilters })}
          />
        </Grid>
        <Grid container item xs={12} md={5}>
          <SavedFilters deidentified={deidentified} infos={infos} {...savedFiltersActions} {...savedFiltersData} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchSection
