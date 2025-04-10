import { Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs/styles'
import { FormContext } from 'components/ui/Modal'
import RadioGroup from 'components/ui/RadioGroup'
import React, { useContext, useEffect, useState } from 'react'
import { LabelObject } from 'types/searchCriterias'

type RadioGroupFilterProps = {
  label?: string
  value: string
  name: string
  options: LabelObject[]
  disabled?: boolean
}

const RadioGroupFilter = ({ name, value, label, options, disabled = false }: RadioGroupFilterProps) => {
  const context = useContext(FormContext)
  const [input, setInput] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, input)
  }, [input])

  return (
    <InputWrapper>
      <Typography variant="h3">{label}</Typography>
      <RadioGroup value={input} onChange={setInput} options={options.map((option) => ({ ...option, disabled }))} row />
    </InputWrapper>
  )
}

export default RadioGroupFilter
