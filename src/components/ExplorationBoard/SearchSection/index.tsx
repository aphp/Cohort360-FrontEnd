import React, { useEffect, useRef, useState } from 'react'
import { Grid } from '@mui/material'
import FilterBy from './FilterBy'
import OccurrencesSearch from './OccurrenceSearch'
import { Filters, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'
import { AdditionalInfo, Search, SearchWithFilters } from '../useExplorationBoard'
import SavedFilters from './SavedFilters'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { DisplayOptions } from '..'
import { useSizeObserver } from 'hooks/ui/useSizeObserver'
import OrderBy from './OrderBy'

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
  searchCriterias: SearchCriterias<Filters>
  infos: AdditionalInfo
  savedFiltersActions: SavedFiltersActions
  savedFiltersData: SavedFiltersData<Filters>
  displayOptions: DisplayOptions
  onSearch: (search: SearchWithFilters) => void
}

const SearchSection = ({
  searchCriterias,
  infos,
  savedFiltersActions,
  savedFiltersData,
  displayOptions,
  onSearch
}: SearchSectionProps) => {
  const { ref, width } = useSizeObserver()

  const handleChangeFields = (search: Search) => {
    if (search.searchBy !== searchCriterias.searchBy) onSearch({ searchBy: search.searchBy })
    if (search.searchInput !== searchCriterias.searchInput) onSearch({ searchInput: search.searchInput })
  }

  return (
    <Grid container justifyContent="space-between" ref={ref}>
      {displayOptions.search && (
        <Grid container item xs={12} sm={!displayOptions.myFilters ? 12 : 6} lg={!displayOptions.myFilters ? 12 : 8}>
          <OccurrencesSearch search={searchCriterias} onChange={handleChangeFields} infos={infos} />
        </Grid>
      )}
      <Grid
        container
        item
        xs={12}
        sm={width < 500 ? 12 : 5}
        lg={width < 500 ? 12 : 4}
        gap={1}
        justifyContent={width < 500 ? 'center' : 'flex-end'}
      >
        {displayOptions.orderBy && (
          <Grid container item xs={12} md={5}>
            <OrderBy
              infos={infos}
              filters={searchCriterias.filters as Filters}
              onSubmit={(newFilters) => onSearch({ filters: newFilters })}
            />
          </Grid>
        )}
        {displayOptions.filterBy && (
          <Grid container item xs={12} md={5}>
            <FilterBy
              infos={infos}
              filters={searchCriterias.filters as Filters}
              onSubmit={(newFilters) => onSearch({ filters: newFilters })}
            />
          </Grid>
        )}
        {displayOptions.myFilters && savedFiltersData.allFilters && savedFiltersData.allFilters.count > 0 && (
          <Grid container item xs={12} md={5}>
            <SavedFilters infos={infos} {...savedFiltersActions} {...savedFiltersData} />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default SearchSection
