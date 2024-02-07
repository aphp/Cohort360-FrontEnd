import { Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import { FormContext } from 'components/ui/Modal'
import React, { ChangeEvent, useContext, useEffect, useState } from 'react'
import { ErrorType } from 'types/error'

type TextInputProps = {
  value?: string
  label?: string
  name: string
  placeholder?: string
  error?: ErrorType
  disabled?: boolean
  minLimit?: number
  maxLimit?: number
  description?: boolean
  minRows?: number
  maxRows?: number
  noSpace?: boolean
}

const TextInput = ({
  name,
  value = '',
  placeholder = '',
  description,
  error,
  label,
  disabled,
  minLimit = 2,
  maxLimit = 100,
  minRows,
  maxRows,
  noSpace = true
}: TextInputProps) => {
  const context = useContext(FormContext)
  const [text, setText] = useState(value || '')
  const [isError, setIsError] = useState({ min: false, max: false, externalError: error?.isError || false })

  useEffect(() => {
    if (text.length > maxLimit || text.length < minLimit) {
      setIsError({ ...isError, max: text.length > maxLimit, min: text.length < minLimit })
      context?.updateError(true)
    } else {
      setIsError({ externalError: false, max: false, min: false })
      context?.updateFormData(name, text)
      context?.updateError(false)
    }
  }, [text])

  useEffect(() => {
    setIsError({ ...isError, externalError: error ? error.isError : false })
  }, [error])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setText(noSpace ? value.replace(/ +(?= )/g, '') : value)
  }

  return (
    <>
      <InputWrapper>
        {label && <Typography variant="h3">{label}</Typography>}
        <TextField
          margin="normal"
          multiline={description}
          minRows={minRows}
          maxRows={maxRows}
          fullWidth
          autoFocus
          disabled={disabled}
          value={text}
          placeholder={(disabled && placeholder) || 'Non renseigné'}
          onChange={handleChange}
        />
      </InputWrapper>
      {isError.max && (
        <Grid>
          <ErrorMessage>Le nom ne peut excéder plus de {maxLimit} caractères.</ErrorMessage>
        </Grid>
      )}

      {error && isError.externalError && (
        <Grid>
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </Grid>
      )}
    </>
  )
}

export default TextInput
