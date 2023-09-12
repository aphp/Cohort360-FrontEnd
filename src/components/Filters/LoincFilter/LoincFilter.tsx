import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal/Modal'
import React, { useContext, useEffect, useState } from 'react'

type LoincFilterProps = {
  value: string
  name: string
}

const LoincFilter = ({ name, value }: LoincFilterProps) => {
  const context = useContext(FormContext)
  const [loinc, setLoinc] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, loinc)
  }, [loinc])

  return (
    <InputWrapper>
      <Typography variant="h3">Code LOINC :</Typography>
      <TextField
        margin="normal"
        fullWidth
        autoFocus
        placeholder="Exemple: A0260,E2068"
        value={loinc}
        onChange={(event) => setLoinc(event.target.value)}
      />
    </InputWrapper>
  )
}

export default LoincFilter
