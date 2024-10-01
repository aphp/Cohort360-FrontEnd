import { Grid, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { ErrorMessage } from 'components/ui/Inputs/Errors'
import React, { useEffect, useState } from 'react'

type TextInputProps = {
  value?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  minLimit?: number
  maxLimit?: number
  errorMessage?: string
  onChange: (newInput: string) => void
  onError?: (isError: boolean) => void
}

const TextInput = ({
  value = '',
  placeholder = '',
  label,
  disabled,
  errorMessage,
  minLimit,
  maxLimit,
  onChange,
  onError
}: TextInputProps) => {
  const [input, setInput] = useState(value)
  //const [isError, setIsError] = useState({ min: false, max: false })

  /*  useEffect(() => {
    if (onError) {
      onError(false)
      if (isError.min || isError.max) onError(true)
    }
  }, [isError])*/

  /*useEffect(() => {
    let min = false
    let max = false
    if (maxLimit && input.length > maxLimit) max = true
    else if (minLimit && input.length < minLimit) min = true
    onChange(input)
    setIsError({ min, max })
  }, [input])*/

  useEffect(() => {
    onChange(input)
  }, [input])

  return (
    <>
      <InputWrapper>
        {label && <Typography variant="h3">{label}</Typography>}
        <TextField
          margin="normal"
          fullWidth
          autoFocus
          disabled={disabled}
          value={input}
          placeholder={placeholder || 'Non renseigné'}
          onChange={(event) => setInput(event.target.value)}
        />
      </InputWrapper>
      {errorMessage && (
        <Grid>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </Grid>
      )}
      {/*isError.max && (
        <Grid>
          <ErrorMessage>Le champ dépasse la limite de {maxLimit} caractères.</ErrorMessage>
        </Grid>
      )*/}
    </>
  )
}

export default TextInput
