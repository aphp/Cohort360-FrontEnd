import React from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import { SelectInputWrapper, SelectWrapper } from './styles'
import { LabelObject } from 'types/searchCriterias'

type SelectProps<T> = {
  value: T
  label?: string
  options: LabelObject[]
  disabled?: boolean
  radius?: number
  onChange?: (value: T) => void
}

const Select = <T,>({ value, label, options, disabled, radius, onChange }: SelectProps<T>) => {
  return (
    <SelectWrapper width="100%">
      <FormControl variant="outlined">
        {label && <InputLabel>{label}</InputLabel>}
        <SelectInputWrapper radius={radius}>
          <SelectMui
            disabled={disabled}
            value={value}
            onChange={(event) => onChange?.(event.target.value as T)}
            variant="outlined"
            label={label}
            sx={{ color: '#303030' }}
          >
            {options.map((option) => (
              <MenuItem key={option.id as string} value={option.id as string} sx={{ color: '#303030' }}>
                {option.label}
              </MenuItem>
            ))}
          </SelectMui>
        </SelectInputWrapper>
      </FormControl>
    </SelectWrapper>
  )
}

export default Select
