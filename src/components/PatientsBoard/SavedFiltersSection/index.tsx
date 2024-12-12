import React from 'react'
import { Grid } from '@mui/material'
import SaveFilterAction from './SaveFilterAction'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { PatientsFilters, SearchByTypes } from 'types/searchCriterias'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'

type SavedFiltersSectionProps = {
  deidentified: boolean
}

const SavedFiltersSection = ({ deidentified }: SavedFiltersSectionProps) => {
  const {
    allSavedFiltersAsListItems,
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    methods: {
      getSavedFilters,
      postSavedFilter,
      deleteSavedFilters,
      patchSavedFilter,
      selectFilter,
      resetSavedFilterError
    }
  } = useSavedFilters<PatientsFilters>(ResourceType.PATIENT)

  return (
    <Grid container item xs={12}>
      <Grid item xs={3}>
        <SaveFilterAction
          //disabled={maintenanceIsActive}
          onSubmit={(name) => {} /*postSavedFilter(name)*/}
        />
      </Grid>
    </Grid>
  )
}

export default SavedFiltersSection
