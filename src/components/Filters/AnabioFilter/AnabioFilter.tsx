import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal/Modal'
import React, { useContext, useEffect, useState } from 'react'

type AnabioFilterProps = {
  value: string
  name: string
}

const AnabioFilter = ({ name, value }: AnabioFilterProps) => {
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
