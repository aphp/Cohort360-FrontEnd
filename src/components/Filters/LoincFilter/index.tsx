import { Typography } from '@mui/material'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'

type LoincFilterProps = {
  value: LabelObject[]
  name: string
  disabled?: boolean
  onFetch: (text: string, exactSearch: boolean, signal: AbortSignal) => Promise<any>
}

const LoincFilter = ({ name, value, disabled = false, onFetch }: LoincFilterProps) => {
  const context = useContext(FormContext)
  const [loinc, setLoinc] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, loinc)
  }, [loinc])

  return (
    <InputWrapper>
      <Typography variant="h3">Code LOINC :</Typography>
      <AsyncAutocomplete
        disabled={disabled}
        label="Code(s) sélectionné(s)"
        variant="outlined"
        noOptionsText="Veuillez entrer un code Loinc"
        values={loinc}
        onFetch={(text, signal) => onFetch(text, false, signal)}
        onChange={(newValue) => {
          setLoinc(newValue)
        }}
      />
    </InputWrapper>
  )
}

export default LoincFilter
