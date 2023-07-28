import React from 'react'
import { FormControl, InputLabel, MenuItem, Select as SelectMui } from '@mui/material'
import useStyles from './styles'

type SelectProps<T> = {
  selectedValue: T
  label: string
  items: { id: T; label: string }[]
  onchange: (value: T) => void
}

const Select = <T,>({ selectedValue, label, items, onchange }: SelectProps<T>) => {
  const { classes } = useStyles()

  return (
    <FormControl variant="outlined" style={{ width: 200 }}>
      <InputLabel>{label}</InputLabel>
      <SelectMui
        value={selectedValue}
        onChange={(event) => onchange(event.target.value as T)}
        className={classes.select}
        variant="outlined"
        label={label}
        style={{ height: 32 }}
      >
        {items.map((item) => (
          <MenuItem key={item.id as string} value={item.id as string}>
            {item.label}
          </MenuItem>
        ))}
      </SelectMui>
    </FormControl>
  )
}

export default Select
