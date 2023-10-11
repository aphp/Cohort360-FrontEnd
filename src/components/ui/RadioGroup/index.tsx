import React from 'react'
import { FormControlLabel, Radio, RadioGroup as RadioGroupMui } from '@mui/material'

type RadioProps<T> = {
  selectedValue: T
  items: { id: T; label: string }[]
  onchange: (value: T) => void
  row?: boolean
}

const RadioGroup = <T,>({ selectedValue, items, onchange, row }: RadioProps<T>) => {
  return (
    <RadioGroupMui value={selectedValue} onChange={(event, value) => onchange(value as T)} row={row}>
      {items.map((item) => (
        <FormControlLabel
          key={item.id as string}
          value={item.id}
          control={<Radio color="secondary" />}
          label={item.label}
        />
      ))}
    </RadioGroupMui>
  )
}

export default RadioGroup
