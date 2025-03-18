import React from 'react'
import { FormControlLabel, Radio, RadioGroup as RadioGroupMui, SxProps } from '@mui/material'

type RadioProps<T> = {
  value: T
  options: { id: T; label: string; disabled?: boolean }[]
  onChange: (value: T) => void
  row?: boolean
  style?: SxProps
}

const RadioGroup = <T,>({ value, options, onChange, row, style }: RadioProps<T>) => {
  return (
    <RadioGroupMui value={value} onChange={(event, value) => onChange(value as T)} row={row} sx={style}>
      {options.map((option) => (
        <FormControlLabel
          key={option.id as string}
          value={option.id}
          control={<Radio color="secondary" />}
          label={option.label}
          disabled={option.disabled}
        />
      ))}
    </RadioGroupMui>
  )
}

export default RadioGroup
