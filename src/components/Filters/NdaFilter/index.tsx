import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type NdaFilterProps = {
  value: string
  name: string
}

const NdaFilter = ({ name, value }: NdaFilterProps) => {
  const context = useContext(FormContext)
  const [nda, setNda] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, nda)
  }, [nda])

  return (
    <InputWrapper>
      <Typography variant="h3">NDA :</Typography>
      <TextField
        fullWidth
        autoFocus
        placeholder="Exemple: 6601289264,141740347"
        value={nda}
        onChange={(event) => setNda(event.target.value)}
      />
    </InputWrapper>
  )
}

export default NdaFilter
