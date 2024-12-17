import React, { useMemo, useState } from 'react'
import { Grid } from '@mui/material'
import SaveFilterAction from './SaveFilterAction'
import { Filters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
import { ResourceType } from 'types/requestCriterias'
import { useSavedFilters } from 'hooks/filters/useSavedFilters'
import SavedFilters from './SavedFilters'
import EditSavedFilter from './EditSavedFilter'

type SavedFiltersSectionProps = {
  deidentified: boolean
  criterias: SearchCriterias<Filters>
  onSelect: (criteria: SearchCriterias<Filters>) => void
}

const SavedFiltersSection = ({ deidentified, criterias, onSelect }: SavedFiltersSectionProps) => {
  const {
    allSavedFilters,
    savedFiltersErrors,
    selectedSavedFilter,
    methods: { next, postSavedFilter, deleteSavedFilters, patchSavedFilter, selectFilter, resetSavedFilterError }
  } = useSavedFilters<PatientsFilters>(ResourceType.PATIENT)
  const [readonly, setReadonly] = useState(false)
  const [openSelected, setOpenSelected] = useState(false)

  const asListItems = useMemo(
    () =>
      allSavedFilters?.results.map((elem) => {
        return { id: elem.uuid, name: elem.name, checked: false }
      }) || [],
    [allSavedFilters]
  )

  return (
    <Grid container item xs={12}>
      <Grid item xs={3}>
        <SaveFilterAction
          //disabled={maintenanceIsActive}
          onSubmit={(name) => postSavedFilter(name, criterias, deidentified)}
        />
      </Grid>
      <Grid item xs={3}>
        {asListItems.length && (
          <SavedFilters
            //disabled={maintenanceIsActive}
            count={allSavedFilters?.count ?? 0}
            criterias={asListItems}
            onSubmit={() => {
              if (selectedSavedFilter) onSelect(selectedSavedFilter.filterParams)
            }}
            onNext={() => next()}
            onDelete={deleteSavedFilters}
            onSelect={selectFilter}
            onDisplay={(display) => {
              console.log("test display")
              setOpenSelected(true)
              setReadonly(display)
            }}
          />
        )}
        {selectedSavedFilter && (
          <EditSavedFilter
            open={openSelected}
            readonly={readonly}
            criteria={selectedSavedFilter}
            onEdit={patchSavedFilter}
            deidentified={deidentified}
          />
        )}
      </Grid>
    </Grid>
  )
}

export default SavedFiltersSection
