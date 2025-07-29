import React from 'react'
import { CircularProgress, Grid } from '@mui/material'
import FilterBy from './FilterBy'
import OccurrencesSearch from './OccurrenceSearch'
import { Filters, SavedFiltersResults, SearchCriterias } from 'types/searchCriterias'
import SavedFilters from './SavedFilters'
import { SelectedFilter } from 'hooks/filters/useSavedFilters'
import { useSizeObserver } from 'hooks/ui/useSizeObserver'
import OrderBy from './OrderBy'
import { DisplayOptions, Search, AdditionalInfo, SearchWithFilters, CountDisplay } from 'types/exploration'
import DisplayDigits from 'components/ui/Display/DisplayDigits'

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
  count: CountDisplay | null
  isLoading?: boolean
  onSearch: (search: SearchWithFilters) => void
}

const SearchSection = ({
  searchCriterias,
  infos,
  savedFiltersActions,
  savedFiltersData,
  displayOptions,
  count,
  isLoading = false,
  onSearch
}: SearchSectionProps) => {
  const {
    ref,
    sizes: { isXS, isMD, isLG, isXL }
  } = useSizeObserver()

  const handleChangeFields = (search: Search) => {
    if (search.searchBy !== searchCriterias.searchBy) onSearch({ searchBy: search.searchBy })
    if (search.searchInput !== searchCriterias.searchInput) onSearch({ searchInput: search.searchInput })
  }
  return (
    <Grid container size={12} sx={{ justifyContent: 'space-between', mt: 0.5 }} ref={ref}>
      <Grid container size={{ xs: 12, lg: displayOptions.sidebar ? 12 : 8 }} spacing={1}>
        {displayOptions.search && (
          <Grid container size={isXS ? 12 : 8} sx={{ alignItems: 'center' }}>
            <OccurrencesSearch search={searchCriterias} onChange={handleChangeFields} infos={infos} />
          </Grid>
        )}
        {displayOptions.filterBy && (
          <Grid container size={isXS ? 12 : 2} sx={{ alignItems: 'center' }}>
            <FilterBy
              infos={infos}
              filters={searchCriterias.filters}
              onSubmit={(newFilters) => onSearch({ filters: newFilters })}
            />
          </Grid>
        )}
        {displayOptions.myFilters && savedFiltersData.allFilters && savedFiltersData.allFilters.count > 0 && (
          <Grid container size={isXS ? 12 : 2} sx={{ alignItems: 'center' }}>
            <SavedFilters infos={infos} {...savedFiltersActions} {...savedFiltersData} />
          </Grid>
        )}
        {displayOptions.orderBy && (
          <Grid container size={isXS ? 12 : 2} sx={{ alignItems: 'center' }}>
            <OrderBy infos={infos} orderBy={searchCriterias.orderBy} onSubmit={(orderBy) => onSearch({ orderBy })} />
          </Grid>
        )}
      </Grid>
      <Grid container size={{ xs: 12, lg: 4 }} sx={{ alignItems: 'center' }}>
        {displayOptions.count && count && (
          <Grid
            container
            size={12}
            sx={{
              alignItems: 'center',
              gap: 1,
              justifyContent: isMD || isLG || isXL ? 'flex-end' : 'center',
              mt: isLG || isXL ? 0 : '12px'
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                {count[0].display && (
                  <DisplayDigits nb={count[0].count.results} total={count[0].count.total} label={count[0].label} />
                )}
                {count[1].display && (
                  <DisplayDigits nb={count[1].count.results} total={count[1].count.total} label={count[1].label} />
                )}
              </>
            )}
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default SearchSection
