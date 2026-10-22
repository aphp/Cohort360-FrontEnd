import React from 'react'

import { Box, Typography } from '@mui/material'

import useStyles from '../DatePicker/styles'
import DateInput from 'components/ui/Inputs/DateInput'

type DatePickerProps = {
  buttonLabel: string
  defaultValue: string | null
  error?: string
  onChangeValue: (newValue: string | null) => void
  onIncomplete: (isIncomplete: boolean) => void
}

const DatePicker = (props: DatePickerProps) => {
  const { buttonLabel, defaultValue, error, onChangeValue, onIncomplete } = props
  const { classes } = useStyles()

  return (
    <Box display="flex" width="220px" padding={'8px 12px'} flexDirection={'column'}>
      <Typography fontWeight={600}>{buttonLabel}</Typography>
      <DateInput
        defaultValue={defaultValue}
        error={error}
        onChange={onChangeValue}
        onIncomplete={onIncomplete}
        className={classes.datePickerInput}
        clearable
      />
    </Box>
  )
}

export default DatePicker
