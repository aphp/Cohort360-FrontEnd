import React from 'react'
import { Grid } from '@mui/material'
import FilterAction from './FilterAction'
import OccurrencesSearch from './OccurrenceSearch'
import { Filters, SearchByTypes, SearchCriterias } from 'types/searchCriterias'

type SearchSectionProps = {
  deidentified: boolean
  criterias: SearchCriterias<Filters>
  onSearch: (searchCriterias: SearchCriterias<Filters>) => void
}

const SearchSection = ({ deidentified, criterias, onSearch }: SearchSectionProps) => {
  
  return (
    <Grid container justifyContent="space-between">
      <Grid container item xs={8}>
        <OccurrencesSearch
          deidentified={deidentified}
          search={{
            searchBy: criterias.searchBy ?? SearchByTypes.TEXT,
            searchInput: criterias.searchInput
          }}
          onChange={(newSearch) => {
            onSearch({
              ...criterias,
              searchBy: newSearch.searchBy,
              searchInput: newSearch.searchInput
            })
          }}
        />
      </Grid>
      <Grid container item xs={3}>
        <FilterAction
          deidentified={deidentified}
          filters={criterias.filters as Filters}
          onSubmit={(newFilters) => onSearch({ ...criterias, filters: newFilters })}
        />
      </Grid>
    </Grid>
  )
}

export default SearchSection
