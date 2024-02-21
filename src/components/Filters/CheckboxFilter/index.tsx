import { Typography, Checkbox as CheckboxMui, Grid } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type CheckboxFilterProps = {
  value?: boolean
  name: string
  label: string
}

const CheckboxFilter = ({ name, value = false, label }: CheckboxFilterProps) => {
  const context = useContext(FormContext)
  const [isChecked, setIsChecked] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, isChecked)
  }, [isChecked])

  return (
    <InputWrapper>
      <Grid container alignItems="center" sx={{ display: 'flex', flexWrap: 'nowrap' }}>
        <CheckboxMui
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          sx={{ padding: '0px 10px 0px 0px' }}
        />
        <Typography variant="h3">{label}</Typography>
      </Grid>
    </InputWrapper>
  )
}

export default CheckboxFilter
