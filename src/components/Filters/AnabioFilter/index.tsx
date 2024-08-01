import { Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import AsyncAutocomplete from 'components/ui/Inputs/AsyncAutocomplete'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'

type AnabioFilterProps = {
  value: LabelObject[]
  name: string
  disabled?: boolean
  onFetch: (text: string, exactSearch: boolean, signal: AbortSignal) => Promise<any>
}

const AnabioFilter = ({ name, value, disabled = false, onFetch }: AnabioFilterProps) => {
  const context = useContext(FormContext)
  const [anabio, setAnabio] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, anabio)
  }, [anabio])

  return (
    <InputWrapper>
      <Typography variant="h3">Code ANABIO :</Typography>
      <AsyncAutocomplete
        disabled={disabled}
        label="Code(s) sélectionné(s)"
        variant="outlined"
        noOptionsText="Veuillez entrer un code Anabio"
        values={anabio}
        onFetch={(text, signal) => onFetch(text, false, signal)}
        onChange={(newValue) => {
          setAnabio(newValue)
        }}
      />
    </InputWrapper>
  )
}

export default AnabioFilter
