import { Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'

type CodeFilterProps = {
  value: LabelObject[]
  name: string
  disabled?: boolean
  onFetch: (text: string, noStar: boolean, signal: AbortSignal) => Promise<any>
}

const CodeFilter = ({ name, value, disabled = false, onFetch }: CodeFilterProps) => {
  const context = useContext(FormContext)
  const [code, setCode] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, code)
  }, [code])

  return (
    <InputWrapper>
      <Typography variant="h3">Code :</Typography>
      <AsyncAutocomplete
        disabled={disabled}
        label="Code(s) sélectionné(s)"
        variant="outlined"
        noOptionsText="Veuillez entrer un code"
        values={value}
        onFetch={(text, signal) => onFetch(text, false, signal)}
        onChange={(newValue) => {
          setCode(newValue)
        }}
      />
    </InputWrapper>
  )
}

export default CodeFilter
