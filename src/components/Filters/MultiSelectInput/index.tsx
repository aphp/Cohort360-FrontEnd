import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/capitalize'

type PrescriptionTypesFilterProps = {
  value: LabelObject[]
  name: string
  label?: string
  options: LabelObject[]
  disabled?: boolean
}

const MultiSelectInput = ({ name, value, label, options, disabled = false }: PrescriptionTypesFilterProps) => {
  const context = useContext(FormContext)
  const [input, setInput] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, input)
  }, [input])

  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          setInput(value)
        }}
        options={options}
        value={input}
        disableCloseOnSelect
        getOptionLabel={(elem) => capitalizeFirstLetter(elem.label)}
        renderOption={(props, elem) => <li {...props}>{capitalizeFirstLetter(elem.label)}</li>}
        renderInput={(params) => <TextField {...params} label="Sélectionner un ou plusieurs éléments" />}
      />
    </InputWrapper>
  )
}

export default MultiSelectInput
