import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type AnabioFilterProps = {
  value: string
  name: string
  disabled?: boolean
}

const AnabioFilter = ({ name, value, disabled = false }: AnabioFilterProps) => {
  const context = useContext(FormContext)
  const [anabio, setAnabio] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, anabio)
  }, [anabio])

  return (
    <InputWrapper>
      <Typography variant="h3">Code ANABIO :</Typography>
      <TextField
        margin="normal"
        disabled={disabled}
        fullWidth
        autoFocus
        placeholder="Exemple: A0260,E2068"
        value={anabio}
        onChange={(event) => setAnabio(event.target.value)}
      />
    </InputWrapper>
  )
}

export default AnabioFilter
