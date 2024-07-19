import React, { useState } from 'react'

import { Collapse, Grid, IconButton, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import VisitInputs from './VisitInputs/VisitInputs'
import OccurrencesDateInputs from './OccurrencesInputs/OccurrencesDateInputs'

import ExecutiveUnitsFilter from 'components/Filters/ExecutiveUnitsFilter'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'

type AdvancedInputsProps = {
  sourceType: SourceType
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const AdvancedInputs = ({ sourceType, selectedCriteria = {}, onChangeValue }: AdvancedInputsProps) => {
  const optionsIsUsed =
    (selectedCriteria.encounterService && selectedCriteria.encounterService.length > 0) ||
    !!selectedCriteria.startOccurrence ||
    !!selectedCriteria.endOccurrence ||
    !!selectedCriteria.encounterStartDate ||
    !!selectedCriteria.encounterEndDate

  const [checked, setCheck] = useState(optionsIsUsed)

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: Hierarchy<ScopeElement, string>[]) => {
    onChangeValue('encounterService', _selectedExecutiveUnits)
  }

  return (
    <Grid container direction="column">
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        style={{ padding: '1em' }}
        onClick={() => setCheck(!checked)}
      >
        <Typography style={{ cursor: 'pointer' }} variant="h6">
          Options avancées
        </Typography>

        <IconButton size="small">
          {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Grid>

      <Collapse in={checked} unmountOnExit>
        <Grid container direction="row" alignItems="center" padding="0em 1em" color="rgba(0, 0, 0, 0.6)">
          <ExecutiveUnitsFilter
            sourceType={sourceType}
            value={selectedCriteria?.encounterService || []}
            name="AdvancedInputs"
            onChange={_onSubmitExecutiveUnits}
          />
        </Grid>

        <VisitInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
        <OccurrencesDateInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
