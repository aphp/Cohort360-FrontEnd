import { Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { ErrorType } from 'types/error'

type TextInputProps = {
  value?: string
  title?: string
  name: string
  error?: ErrorType
  disabled?: boolean
  minLimit?: number
  maxLimit?: number
}

const TextInput = ({ name, value = '', error, title, disabled, minLimit, maxLimit }: TextInputProps) => {
  const context = useContext(FormContext)
  const [filtersName, setFiltersName] = useState(value)
  const [isError, setIsError] = useState({ min: false, max: false, serverError: false })

  useEffect(() => {
    context?.updateError(false)
    if (isError.min || isError.max || isError.serverError) context?.updateError(true)
  }, [isError])

  useEffect(() => {
    let min = false
    let max = false
    const serverError = false
    if (maxLimit && filtersName.length > maxLimit) {
      max = true
    } else if (minLimit && filtersName.length < minLimit) {
      min = true
    } else if (context?.updateFormData) context.updateFormData(name, filtersName)
    setIsError({ min, max, serverError })
  }, [filtersName])

  useEffect(() => {
    setIsError({ ...isError, serverError: error ? error.isError : false })
  }, [error])

  return (
    <>
      <InputWrapper>
        {title && <Typography variant="h3">{title}</Typography>}
        <TextField
          margin="normal"
          fullWidth
          autoFocus
          disabled={disabled}
          value={filtersName}
          onChange={(event) => setFiltersName(event.target.value)}
        />
      </InputWrapper>
      {isError.max && (
        <Grid>
          <ErrorMessage>Le nom de sauvegarde du filtre ne peut excéder plus de {maxLimit} caractères.</ErrorMessage>
        </Grid>
      )}

      {error && isError.serverError && (
        <Grid>
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </Grid>
      )}
    </>
  )
}

export default TextInput
