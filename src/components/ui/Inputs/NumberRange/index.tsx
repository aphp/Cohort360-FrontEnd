import React, { useEffect, useState } from 'react'
import { FormLabel, Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import { BlockWrapper } from 'components/ui/Layout'
import { DurationRangeType } from 'types/searchCriterias'

type PatientsNbFilterProps = {
  label?: string
  type: string
  values: DurationRangeType
  onError: (isError: boolean) => void
  onChange: (values: DurationRangeType) => void
}

const PatientsNbFilter = ({ label, values, type, onError, onChange }: PatientsNbFilterProps) => {
  const [error, setError] = useState(false)
  const [range, setRange] = useState(values)

  useEffect(() => {
    onError(error)
  }, [error, onError])

  useEffect(() => {
    setError(false)
    if (Number(range[0]) && Number(range[1]) && Number(range[0]) > Number(range[1])) {
      setError(true)
    }
    onChange(range)
  }, [range, onChange])

  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <Grid container justifyContent="space-between">
        <Grid container item xs={5} alignItems="baseline" justifyContent="space-between">
          <FormLabel component="legend">Au moins :</FormLabel>
          <TextField
            type="number"
            value={range[0]}
            onChange={(event) => setRange([event.target.value, range[1]])}
            inputProps={{ min: 0 }}
            variant="standard"
            size="small"
            style={{ width: '30%' }}
          />
          <FormLabel component="legend">patient(s).</FormLabel>
        </Grid>
        <Grid container item xs={5} alignItems="baseline" justifyContent="space-between">
          <FormLabel component="legend">Jusqu'à :</FormLabel>
          <TextField
            type="number"
            value={range[1]}
            onChange={(event) => setRange([range[0], event.target.value])}
            inputProps={{ min: 0 }}
            variant="standard"
            size="small"
            style={{ width: '30%' }}
          />
          <FormLabel component="legend">{type}.</FormLabel>
        </Grid>
      </Grid>

      {error && (
        <BlockWrapper margin="15px 0px">
          <ErrorMessage>Vous ne pouvez pas sélectionner de minimum de {type} supérieur au nombre maximum.</ErrorMessage>
        </BlockWrapper>
      )}
    </InputWrapper>
  )
}

export default PatientsNbFilter
