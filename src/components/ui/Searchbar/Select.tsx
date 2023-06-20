import React from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import { SelectInputWrapper, SelectWrapper } from './styles'

type SelectProps<T> = {
  selectedValue: T
  label: string
  items: { id: T; label: string }[]
  width?: string
  onchange: (value: T) => void
}

const Select = <T,>({ selectedValue, label, items, width = '100%', onchange }: SelectProps<T>) => {
  return (
    <SelectWrapper width={width}>
      <FormControl variant="outlined">
        <InputLabel>{label}</InputLabel>
        <SelectInputWrapper>
          <SelectMui
            value={selectedValue}
            onChange={(event) => onchange(event.target.value as T)}
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
