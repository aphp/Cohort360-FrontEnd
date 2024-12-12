import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import FilterAction from './FilterAction'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import OccurrencesSearch from './OccurrenceSearch'
import { SearchByTypes, SearchCriterias } from 'types/searchCriterias'

type SearchSectionProps<T> = {
  deidentified: boolean
  onSearch: (searchCriterias: SearchCriterias<T>) => void
}

const SearchSection = <T,>({ deidentified, onSearch }: SearchSectionProps<T>) => {
  const [{ searchBy, searchInput, filters }, { changeSearchBy, changeSearchInput, addFilters }] =
    useSearchCriterias(initPatientsSearchCriterias)

  useEffect(() => onSearch({ searchBy, searchInput, filters }), [searchBy, searchInput, filters])

  return (
    <Grid container justifyContent="space-between">
      <Grid container item xs={8}>
        <OccurrencesSearch
          search={{ searchBy: searchBy ?? SearchByTypes.TEXT, searchInput }}
          onChange={(newSearch) => {
            changeSearchBy(newSearch.searchBy)
            changeSearchInput(newSearch.searchInput)
          }}
        />
      </Grid>
      <Grid container item xs={3}>
        <FilterAction deidentified={deidentified} filters={filters} onSubmit={(newFilters) => addFilters(newFilters)} />
      </Grid>
    </Grid>
  )
}

export default SearchSection
