import React, { forwardRef } from 'react'
import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { LabelObject } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'

type CheckboxGroupProps<T> = {
  value: T[]
  label?: string
  disabled?: boolean
  options: LabelObject[]
  onChange: (value: T[]) => void
}

const CheckboxGroup = forwardRef(
  <T extends string>(
    { value, label, options, disabled = false, onChange }: CheckboxGroupProps<T>,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = toggleFilter(value, event.target.value as T)
      onChange(newValue)
    }

    return (
      <InputWrapper ref={ref}>
        {label && <Typography variant="h3">{label}</Typography>}
        <FormGroup row>
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              disabled={disabled}
              checked={isChecked(option.id, value)}
              value={option.id}
              control={<Checkbox color="secondary" onChange={handleChange} />}
              label={option.label}
            />
          ))}
        </FormGroup>
      </InputWrapper>
    )
  }
) as <T extends string>(props: CheckboxGroupProps<T> & { ref?: React.Ref<HTMLDivElement> }) => JSX.Element

export default CheckboxGroup
