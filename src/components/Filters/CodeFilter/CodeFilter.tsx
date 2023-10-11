import { TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type CodeFilterProps = {
  value: string
  name: string
}

const CodeFilter = ({ name, value }: CodeFilterProps) => {
  const context = useContext(FormContext)
  const [code, setCode] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, code)
  }, [code])

  return (
    <InputWrapper>
      <Typography variant="h3">Code :</Typography>
      <TextField
        fullWidth
        placeholder="Exemple: G629,R2630,F310"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
    </InputWrapper>
  )
}

export default CodeFilter
