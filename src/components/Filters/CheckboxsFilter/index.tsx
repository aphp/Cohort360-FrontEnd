import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'

type CheckboxsFilterProps = {
  value: string[]
  name: string
  label?: string
  disabled?: boolean
  options: LabelObject[]
}

const CheckboxsFilter = ({ name, value, label, options, disabled = false }: CheckboxsFilterProps) => {
  const context = useContext(FormContext)
  const [inputs, setInputs] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, inputs)
  }, [inputs])

  return (
    <InputWrapper>
      {label && <Typography variant="h3">{label}</Typography>}
      <FormGroup row={true} onChange={(e) => setInputs(toggleFilter(inputs, (e.target as HTMLInputElement).value))}>
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

export default CheckboxsFilter
