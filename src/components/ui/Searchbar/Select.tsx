import React from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import { SelectInputWrapper, SelectWrapper } from './styles'

type SelectProps<T> = {
  value: T
  label: string
  items: { id: T; label: string }[]
  disabled?: boolean
  onchange?: (value: T) => void
}

const Select = <T,>({ value, label, items, disabled, onchange }: SelectProps<T>) => {
  return (
    <SelectWrapper width="100%">
      <FormControl variant="outlined">
        <InputLabel>{label}</InputLabel>
        <SelectInputWrapper>
          <SelectMui
            disabled={disabled}
            value={value}
            onChange={(event) => onchange?.(event.target.value as T)}
            variant="outlined"
            label={label}
          >
            {items.map((item) => (
              <MenuItem key={item.id as string} value={item.id as string}>
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
