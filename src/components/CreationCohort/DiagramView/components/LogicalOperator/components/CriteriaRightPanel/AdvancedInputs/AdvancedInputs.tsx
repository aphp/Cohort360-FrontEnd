import React, { useState } from 'react'

import { Collapse, Grid, IconButton, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import OccurrencesInputs from './OccurrencesInputs/OccurrencesInputs'
import VisitInputs from './VisitInputs/VisitInputs'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { UNITE_EXECUTRICE } from 'utils/cohortCreation'
import { ScopeTreeRow } from 'types'

type AdvancedInputsProps = {
  form: 'cim10' | 'ccam' | 'ghm' | 'document' | 'medication' | 'biology'
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const AdvancedInputs: React.FC<AdvancedInputsProps> = (props) => {
  const { form, selectedCriteria = {}, onChangeValue } = props
  const optionsIsUsed =
    +selectedCriteria.occurrence !== 1 ||
    selectedCriteria.occurrenceComparator !== '>=' ||
    !!selectedCriteria.startOccurrence ||
    !!selectedCriteria.endOccurrence ||
    !!selectedCriteria.encounterStartDate ||
    !!selectedCriteria.encounterEndDate

  const [checked, setCheck] = useState(optionsIsUsed)

  const _onSubmitExecutiveUnits = (_selectedExecutiveUnits: ScopeTreeRow[] | undefined) => {
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
        <Grid item container direction="row" alignItems="center" style={{ padding: '1em' }}>
          <PopulationCard
            form={form}
            label={UNITE_EXECUTRICE}
            title={UNITE_EXECUTRICE}
            executiveUnits={selectedCriteria?.encounterService ?? []}
            isAcceptEmptySelection={true}
            isDeleteIcon={true}
            onChangeExecutiveUnits={_onSubmitExecutiveUnits}
          />
        </Grid>

        <VisitInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />

        <OccurrencesInputs form={form} selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
