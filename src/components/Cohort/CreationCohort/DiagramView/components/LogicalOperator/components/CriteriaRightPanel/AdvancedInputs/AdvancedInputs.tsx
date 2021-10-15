import React, { useState } from 'react'

import { Collapse, Typography, Grid, IconButton } from '@material-ui/core'

import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import OccurrencesInputs from './OccurrencesInputs/OccurrencesInputs'
import VisitInputs from './VisitInputs/VisitInputs'

type AdvancedInputsProps = {
  form: 'cim10' | 'ccam' | 'ghm' | 'document' | 'medication'
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
        {form !== 'medication' && <VisitInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />}

        <OccurrencesInputs form={form} selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
