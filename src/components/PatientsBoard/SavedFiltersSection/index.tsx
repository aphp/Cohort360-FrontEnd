import React, { useMemo } from 'react'
import { Grid } from '@mui/material'
import SaveFilterAction from './SaveFilterAction'
import { Filters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import SavedFilters from './SavedFilters'

type SavedFiltersSectionProps = {
  deidentified: boolean
  canSave: boolean
  criterias: SearchCriterias<Filters>
  onSelect: (criteria: SearchCriterias<Filters>) => void
}

const SavedFiltersSection = ({ deidentified, criterias, canSave, onSelect }: SavedFiltersSectionProps) => {
  const {
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetSavedFilterError }
  } = useSavedFilters<PatientsFilters>(ResourceType.PATIENT)

  const asListItems = useMemo(
    () =>
      allSavedFilters?.results.map((elem) => {
        return { id: elem.uuid, name: elem.name, checked: false }
      }) || [],
    [allSavedFilters]
  )
  return (
    <Grid container item xs={12}>
      {canSave && (
        <Grid item xs={3}>
          <SaveFilterAction
            //disabled={maintenanceIsActive}
            onSubmit={(name) => postSavedFilter(name, criterias, deidentified)}
          />
        </Grid>
      )}
      <Grid item xs={3}>
        {asListItems.length > 0 && (
          <SavedFilters
            deidentified={deidentified}
            //disabled={maintenanceIsActive}
            count={allSavedFilters?.count ?? 0}
            criterias={asListItems}
            onSubmit={() => {
              if (selectedSavedFilter) onSelect(selectedSavedFilter.filterParams)
            }}
            selectedFilter={selectedSavedFilter}
            onNext={() => next()}
            onEdit={patchSavedFilter}
            onDelete={deleteSavedFilters}
            onSelect={selectFilter}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default SavedFiltersSection
