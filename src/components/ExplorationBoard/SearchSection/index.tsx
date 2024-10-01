import React from 'react'
import { Grid } from '@mui/material'
import FilterBy from './FilterBy'
import OccurrencesSearch from './OccurrenceSearch'
import { Filters, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'
import SavedFilters from './SavedFilters'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { useSizeObserver } from 'hooks/ui/useSizeObserver'
import OrderBy from './OrderBy'
import { DisplayOptions, Search, AdditionalInfo, SearchWithFilters } from 'types/exploration'

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

type SearchSectionProps<T> = {
  searchCriterias: SearchCriterias<Filters>
  infos: AdditionalInfo
  savedFiltersActions: SavedFiltersActions
  savedFiltersData: SavedFiltersData<Filters>
  displayOptions: DisplayOptions
  onSearch: (search: SearchWithFilters<T>) => void
}

const SearchSection = <T,>({
  searchCriterias,
  infos,
  savedFiltersActions,
  savedFiltersData,
  displayOptions,
  onSearch
}: SearchSectionProps<T>) => {
  const {
    ref,
    sizes: { isXS, isSM }
  } = useSizeObserver()

  const handleChangeFields = (search: Search) => {
    if (search.searchBy !== searchCriterias.searchBy) onSearch({ searchBy: search.searchBy })
    if (search.searchInput !== searchCriterias.searchInput) onSearch({ searchInput: search.searchInput })
  }

  return (
    <Grid container justifyContent="space-between" gap={isXS ? '10px' : 0} ref={ref}>
      {displayOptions.search && (
        <Grid container item xs={isXS ? 12 : 8}>
          <OccurrencesSearch search={searchCriterias} onChange={handleChangeFields} infos={infos} />
        </Grid>
      )}
      <Grid container item xs={isXS ? 12 : 4} gap={isXS ? '10px' : isSM ? 0 : '10px'} justifyContent="flex-end">
        {displayOptions.filterBy && (
          <Grid container item xs={isXS ? 12 : isSM ? 6 : 5}>
            <FilterBy
              infos={infos}
              filters={searchCriterias.filters as Filters}
              onSubmit={(newFilters) => onSearch({ filters: newFilters })}
            />
          </Grid>
        )}
        {displayOptions.myFilters && savedFiltersData.allFilters && savedFiltersData.allFilters.count > 0 && (
          <Grid container item xs={isXS ? 12 : isSM ? 6 : 5}>
            <SavedFilters infos={infos} {...savedFiltersActions} {...savedFiltersData} />
          </Grid>
        )}
        {displayOptions.orderBy && (
          <Grid container item xs={isXS ? 12 : isSM ? 6 : 5}>
            <OrderBy infos={infos} orderBy={searchCriterias.orderBy} onSubmit={(orderBy) => onSearch({ orderBy })} />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default SearchSection
