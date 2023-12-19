import React, { useContext, useEffect, useState } from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import { SelectInputWrapper, SelectWrapper } from './styles'
import { FormContext } from '../Modal'

type SelectProps<T> = {
  value: T
  label: string
  items: { id: T; label: string }[]
  width?: string
  disabled?: boolean
  name?: string
  onchange?: (value: T) => void
}

const Select = <T,>({ value, label, items, width = '100%', disabled, name, onchange }: SelectProps<T>) => {
  const context = useContext(FormContext)
  const [activeValue, setActiveValue] = useState<T>(value)

  useEffect(() => {
    if (context?.updateFormData && name) context.updateFormData(name, activeValue)
    if (onchange) onchange(activeValue)
  }, [activeValue])

  return (
    <SelectWrapper width={width}>
      <FormControl variant="outlined">
        <InputLabel>{label}</InputLabel>
        <SelectInputWrapper>
          <SelectMui
            disabled={disabled}
            value={activeValue}
            onChange={(event) => setActiveValue(event.target.value as T)}
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
