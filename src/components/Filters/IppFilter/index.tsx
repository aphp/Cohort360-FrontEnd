import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type IppFilterProps = {
  value: string
  name: string
  disabled?: boolean
}

const IppFilter = ({ name, value, disabled = false }: IppFilterProps) => {
  const context = useContext(FormContext)
  const [ipp, setIpp] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, ipp)
  }, [ipp])

  return (
    <InputWrapper>
      <Typography variant="h3">IPP :</Typography>
      <TextField
        disabled={disabled}
        fullWidth
        autoFocus
        placeholder={disabled ? 'Non renseigné ' : 'Exemple: 8000000000001,8000000000002'}
        value={ipp}
        onChange={(event) => setIpp(event.target.value)}
      />
    </InputWrapper>
  )
}

export default IppFilter
