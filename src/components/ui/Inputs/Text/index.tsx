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

const TextInput = ({ value = '', placeholder = '', label, disabled, errorMessage, onChange }: TextInputProps) => {
  const [input, setInput] = useState(value)

  useEffect(() => {
    onChange(input)
  }, [input, onChange])

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
    </>
  )
}

export default TextInput
