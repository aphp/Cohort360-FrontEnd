import React from 'react'
import { FormControlLabel, Radio, RadioGroup as RadioGroupMui, SxProps, Typography } from '@mui/material'
import { InputWrapper } from '../Inputs/styles'

type RadioProps<T> = {
  value: T
  label?: string
  options: { id: T; label: string; disabled?: boolean }[]
  row?: boolean
  style?: SxProps
  onChange: (value: T) => void
}

const RadioGroup = <T,>({ value, options, row, style, label, onChange }: RadioProps<T>) => {
  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
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
    </InputWrapper>
  )
}

export default RadioGroup
