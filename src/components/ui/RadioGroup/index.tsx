import React from 'react'
import { FormControlLabel, Radio, RadioGroup as RadioGroupMui, SxProps } from '@mui/material'

type RadioProps<T> = {
  selectedValue: T
  items: { id: T; label: string; disabled?: boolean }[]
  onchange: (value: T) => void
  row?: boolean
  style?: SxProps
}

const RadioGroup = <T,>({ selectedValue, items, onchange, row, style }: RadioProps<T>) => {
  return (
    <RadioGroupMui value={selectedValue} onChange={(event, value) => onchange(value as T)} row={row} sx={style}>
      {items.map((item) => (
        <FormControlLabel
          key={item.id as string}
          value={item.id}
          control={<Radio color="secondary" />}
          label={item.label}
          disabled={item.disabled}
        />
      ))}
    </RadioGroupMui>
  )
}

export default RadioGroup
