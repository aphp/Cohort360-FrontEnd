import { Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { ErrorType } from 'types/error'

type FiltersNameFilterProps = {
  value?: string
  name: string
  error: ErrorType
}

const FiltersNameFilter = ({ name, value = '', error }: FiltersNameFilterProps) => {
  const context = useContext(FormContext)
  const [filtersName, setFiltersName] = useState(value)
  const [isError, setIsError] = useState({ min: false, max: false })

  const onError = (isError: boolean) => {
    if (context?.updateError) context?.updateError(isError)
  }

  useEffect(() => {
    onError(isError.min || isError.max || error.isError)
  }, [isError, error])

  useEffect(() => {
    let min = false
    let max = false
    if (filtersName.length > 50) {
      max = true
    } else if (filtersName.length < 2) {
      min = true
    } else if (context?.updateFormData) context.updateFormData(name, filtersName)
    setIsError({ min, max })
  }, [filtersName])

  return (
    <>
      <InputWrapper>
        <Typography variant="h3">Nom :</Typography>
        <TextField
          margin="normal"
          fullWidth
          autoFocus
          value={filtersName}
          onChange={(event) => setFiltersName(event.target.value)}
        />
      </InputWrapper>
      {isError.max && (
        <Grid>
          <ErrorMessage>Le nom de sauvegarde du filtre ne peut excéder plus de 50 caractères.</ErrorMessage>
        </Grid>
      )}

      {error.isError && (
        <Grid>
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </Grid>
      )}
    </>
  )
}

export default FiltersNameFilter
