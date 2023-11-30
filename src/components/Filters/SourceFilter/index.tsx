import React, { useContext, useEffect, useState } from 'react'
import { RadioGroup, Radio, FormControlLabel, Typography } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'

type SourceFilterProps = {
  value: string
  name: string
}

const SourceFilter = ({ name, value }: SourceFilterProps) => {
  const context = useContext(FormContext)
  const [source, setSource] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, source)
  }, [source])

  return (
    <InputWrapper>
      <Typography variant="h3">Source :</Typography>
      <RadioGroup
        row
        style={{ justifyContent: 'space-around' }}
        aria-label="mode"
        name="criteria-mode-radio"
        value={source}
        onChange={(e) => setSource((e.target as HTMLInputElement).value)}
      >
        <FormControlLabel value="AREM" control={<Radio color="secondary" />} label="AREM" />
        <FormControlLabel value="ORBIS" control={<Radio color="secondary" />} label="ORBIS" />
      </RadioGroup>
    </InputWrapper>
  )
}

export default SourceFilter
