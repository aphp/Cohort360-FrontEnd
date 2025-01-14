import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import React, { useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'

type CheckboxGroupProps<T> = {
  value: T[]
  label?: string
  disabled?: boolean
  options: LabelObject[]
  onChange: (value: T[]) => void
}

const CheckboxGroup = <T extends string>({
  value,
  label,
  options,
  onChange,
  disabled = false
}: CheckboxGroupProps<T>) => {
  const [inputs, setInputs] = useState(value)

  useEffect(() => {
    onChange(inputs)
  }, [inputs])

  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <FormGroup
        row={true}
        onChange={(e) => setInputs(toggleFilter(inputs, (e.target as HTMLInputElement).value as T))}
      >
        <>
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              disabled={disabled}
              checked={isChecked(option.id, inputs)}
              value={option.id}
              control={<Checkbox color="secondary" />}
              label={option.label}
            />
          ))}
        </>
      </FormGroup>
    </InputWrapper>
  )
}

export default CheckboxGroup
