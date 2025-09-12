import React, { useEffect, useMemo, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Box
} from '@mui/material'

import { capitalizeFirstLetter } from 'utils/capitalize'
import useStyles from './styles'
import { LabelObject, TimelineFilter } from 'types/searchCriterias'
import useSearchCriterias from 'reducers/searchCriteriasReducer'
import { ResourceType } from 'types/requestCriterias'
import FilterBy from 'components/ExplorationBoard/SearchSection/FilterBy'
import { selectFiltersAsArray } from 'utils/filters'
import CriteriasSection from 'components/ExplorationBoard/CriteriasSection'

type FiltersProps = {
  diagnosticTypesList: LabelObject[]
  encounterStatusList: LabelObject[]
  onChange: (newFilters: TimelineFilter) => void
}
const initSearchCriterias = () => ({
  filters: {
    diagnosticTypes: [],
    encounterStatus: []
  }
})

const Filters = ({ diagnosticTypesList, encounterStatusList, onChange }: FiltersProps) => {
  const [{ filters }, { addFilters, removeFilter }] = useSearchCriterias(initSearchCriterias(), ResourceType.PROCEDURE)

  const criterias = useMemo(() => {
    return filters ? selectFiltersAsArray(filters, '') : []
  }, [filters])

  return (
    <>
      <Box width="100px" marginBottom={2}>
        <FilterBy
          filters={filters}
          infos={{
            deidentified: false,
            type: ResourceType.PROCEDURE,
            diagnosticTypesList: diagnosticTypesList,
            encounterStatusList: encounterStatusList
          }}
          onSubmit={addFilters}
        />
      </Box>

      <CriteriasSection value={criterias} displayOptions={{ criterias: true }} onDelete={removeFilter} />
    </>
  )
}

export default Filters
