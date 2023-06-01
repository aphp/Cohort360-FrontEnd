import React, { useState } from 'react'

import { Collapse, Grid, IconButton, Typography } from '@mui/material'

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import VisitInputs from './VisitInputs/VisitInputs'
import { CriteriaNameType } from 'types'

type AdvancedInputsProps = {
  form: CriteriaNameType
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const AdvancedInputs: React.FC<AdvancedInputsProps> = (props) => {
  const { selectedCriteria = {}, onChangeValue } = props
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
        <VisitInputs selectedCriteria={selectedCriteria} onChangeValue={onChangeValue} />
      </Collapse>
    </Grid>
  )
}

export default AdvancedInputs
