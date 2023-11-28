import React from 'react'

import { FormControl, FormLabel, Grid, IconButton, Input, InputLabel } from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'

import useStyles from './styles'

type OccurrenceDateInputsProps = {
  selectedCriteria: any
  onChangeValue: (key: string, value: any) => void
}

const OccurrenceDateInputs: React.FC<OccurrenceDateInputsProps> = (props) => {
  const { onChangeValue, selectedCriteria } = props

  const { classes } = useStyles()

  return (
    <>
      <FormLabel style={{ padding: '1em 1em 0 1em' }} component="legend">
        Date d'occurrence
      </FormLabel>

      <Grid style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-start-occurrence">
            Après le
          </InputLabel>
          <Input
            id="date-start-occurrence"
            type="date"
            value={selectedCriteria?.startOccurrence}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('startOccurrence', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('startOccurrence', e.target.value)}
          />
        </FormControl>

        <FormControl className={classes.inputItem}>
          <InputLabel shrink htmlFor="date-end-occurrence">
            Avant le
          </InputLabel>
          <Input
            id="date-end-occurrence"
            type="date"
            value={selectedCriteria?.endOccurrence}
            endAdornment={
              <IconButton size="small" onClick={() => onChangeValue('endOccurrence', '')}>
                <ClearIcon />
              </IconButton>
            }
            onChange={(e) => onChangeValue('endOccurrence', e.target.value)}
          />
        </FormControl>
      </Grid>
    </>
  )
}

export default OccurrenceDateInputs
