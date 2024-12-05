import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { LabelObject } from 'types/searchCriterias'

type SimpleSelectProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  options: LabelObject[]
}

const SimpleSelect = (props: SimpleSelectProps) => {
  const { label, value, onChange } = props
  return (
    <FormControl variant="outlined" style={{ width: '100%' }}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select value={value} onChange={(event) => onChange(event.target.value)} variant="outlined" label={label}>
        {props.options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SimpleSelect
