import React from 'react'

import { FormControl, FormLabel, Grid, Input, InputLabel, IconButton } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'

import useStyles from './styles'

type VisitInputsProps = {
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const VisitInputs: React.FC<VisitInputsProps> = (props) => {
  const { selectedCriteria, onChangeValue } = props

  const classes = useStyles()

  return (
    <>
      <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
        Date de prise en charge
      </FormLabel>

      <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-start-occurrence">
            Après le
          </InputLabel>
          <Input
            id="date-start-occurrence"
            type="date"
            value={selectedCriteria.encounterStartDate}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('encounterStartDate', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('encounterStartDate', e.target.value)}
          />
        </FormControl>

        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-end-occurrence">
            Avant le
          </InputLabel>
          <Input
            id="date-end-occurrence"
            type="date"
            value={selectedCriteria.encounterEndDate}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('encounterEndDate', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('encounterEndDate', e.target.value)}
          />
        </FormControl>
      </Grid>
    </>
  )
}

export default VisitInputs
