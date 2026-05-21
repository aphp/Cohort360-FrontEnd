import React from 'react'
import { Autocomplete, Chip, TextField, Typography } from '@mui/material'
import CancelIcon from '@mui/icons-material/Cancel'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { LabelObject } from 'types/searchCriterias'
import { capitalizeFirstLetter } from 'utils/string'

type MultiSelectProps = {
  value: LabelObject[]
  label?: string
  options: LabelObject[]
  disabled?: boolean
  placeholder?: string
  onChange: (elems: LabelObject[]) => void
}

const MultiSelect = ({ value, placeholder, label, options, disabled = false, onChange }: MultiSelectProps) => {
  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <Autocomplete
        disabled={disabled}
        multiple
        onChange={(event, newValues) => {
          onChange(newValues)
        }}
        options={options}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={value}
        disableCloseOnSelect
        getOptionLabel={(elem) => capitalizeFirstLetter(elem.label)}
        renderOption={(props, elem) => <li {...props}>{capitalizeFirstLetter(elem.label)}</li>}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { onDelete } = getTagProps({ index })
            return (
              <Chip
                key={option.id}
                label={capitalizeFirstLetter(option.label)}
                onDelete={onDelete}
                deleteIcon={<CancelIcon data-testid="CancelIcon" />}
              />
            )
          })
        }
        renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
      />
    </InputWrapper>
  )
}

export default MultiSelect
