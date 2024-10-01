import React from 'react'
import { Autocomplete, TextField, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/capitalize'

type MultiSelectProps = {
  value: LabelObject[]
  label?: string
  options: LabelObject[]
  disabled?: boolean
  onChange: (elems: LabelObject[]) => void
}

const MultiSelect = ({ value, label, options, disabled = false, onChange }: MultiSelectProps) => {
  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, value) => {
          onChange(value)
        }}
        options={options}
        value={value}
        disableCloseOnSelect
        getOptionLabel={(elem) => capitalizeFirstLetter(elem.label)}
        renderOption={(props, elem) => <li {...props}>{capitalizeFirstLetter(elem.label)}</li>}
        renderInput={(params) => <TextField {...params} label="Sélectionner un ou plusieurs éléments" />}
      />
    </InputWrapper>
  )
}

export default MultiSelect
