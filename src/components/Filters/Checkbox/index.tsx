import { Typography, Checkbox as CheckboxMui, Grid } from '@mui/material'
import { InputWrapper } from 'components/ui/Inputs'
import { FormContext } from 'components/ui/Modal'
import React, { useContext, useEffect, useState } from 'react'

type CheckboxProps = {
  value?: boolean
  name: string
  label: string
}

const Checkbox = ({ name, value = false, label }: CheckboxProps) => {
  const context = useContext(FormContext)
  const [isChecked, setIsChecked] = useState(value)

  useEffect(() => {
    if (context?.updateFormData) context.updateFormData(name, isChecked)
  }, [isChecked])

  return (
    <InputWrapper>
      <Grid container alignItems="center">
        <Grid item xs={11}>
          <Typography variant="h3">{label}</Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          <CheckboxMui checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
        </Grid>
      </Grid>
    </InputWrapper>
  )
}

export default Checkbox
