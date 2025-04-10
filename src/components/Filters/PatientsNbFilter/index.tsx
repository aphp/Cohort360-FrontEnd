import { FormLabel, Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import { BlockWrapper } from 'components/ui/Layout'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { DurationRangeType } from 'types/searchCriterias'

type PatientsNbFilterProps = {
  values: DurationRangeType
  names: string[]
}

const PatientsNbFilter = ({ names, values }: PatientsNbFilterProps) => {
  const context = useContext(FormContext)
  const [patientsNb, setPatientsNb] = useState(values)
  const [error, setError] = useState(false)

  const onError = (isError: boolean) => {
    context?.updateError(isError)
  }

  useEffect(() => {
    setError(false)
    onError(false)
    if (Number(patientsNb[0]) && Number(patientsNb[1]) && Number(patientsNb[0]) > Number(patientsNb[1])) {
      setError(true)
      onError(true)
    }
  }, [patientsNb])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[0], patientsNb[0])
  }, [patientsNb[0]])

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(names[1], patientsNb[1])
  }, [patientsNb[1]])

  return (
    <InputWrapper>
      <Typography variant="h3">Nombre de patients :</Typography>
      <Grid container justifyContent="space-between">
        <Grid container item xs={5} alignItems="baseline" justifyContent="space-between">
          <FormLabel component="legend">Au moins :</FormLabel>
          <TextField
            type="number"
            value={patientsNb[0]}
            onChange={(event) => setPatientsNb([event.target.value, patientsNb[1]])}
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
            value={patientsNb[1]}
            onChange={(event) => setPatientsNb([patientsNb[0], event.target.value])}
            inputProps={{ min: 0 }}
            variant="standard"
            size="small"
            style={{ width: '30%' }}
          />
          <FormLabel component="legend">patient(s).</FormLabel>
        </Grid>
      </Grid>

      {error && (
        <BlockWrapper margin="15px 0px">
          <ErrorMessage>
            Vous ne pouvez pas sélectionner de minimum de patients supérieur au nombre maximum.
          </ErrorMessage>
        </BlockWrapper>
      )}
    </InputWrapper>
  )
}

export default PatientsNbFilter
