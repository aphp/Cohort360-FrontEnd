import React from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import { SelectInputWrapper, SelectWrapper } from './styles'

type SelectProps<T> = {
  value: T
  label: string
  items: { id: T; label: string }[]
  disabled?: boolean
  radius?: number
  onchange?: (value: T) => void
}

const Select = <T,>({ value, label, items, disabled, radius, onchange }: SelectProps<T>) => {
  return (
    <SelectWrapper width="100%">
      <FormControl variant="outlined">
        <InputLabel>{label}</InputLabel>
        <SelectInputWrapper radius={radius}>
          <SelectMui
            disabled={disabled}
            value={value}
            onChange={(event) => onchange?.(event.target.value as T)}
            variant="outlined"
            label={label}
            sx={{ color: '#303030' }}
          >
            {items.map((item) => (
              <MenuItem key={item.id as string} value={item.id as string} sx={{ color: '#303030' }}>
                {item.label}
              </MenuItem>
            ))}
          </SelectMui>
        </SelectInputWrapper>
      </FormControl>
    </SelectWrapper>
  )
}

export default Select
