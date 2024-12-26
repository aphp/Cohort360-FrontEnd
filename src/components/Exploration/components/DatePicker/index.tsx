import React from 'react'

import { Box, TextField, Typography } from '@mui/material'

import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import useStyles from '../DatePicker/styles'

type DatePickerProps = {
  buttonLabel: string
  value: string | null
  onChangeValue: (newValue: string | null) => void
}

const DatePicker: React.FC<DatePickerProps> = ({ buttonLabel, value, onChangeValue }) => {
  const { classes } = useStyles()

  return (
    <Box display="flex" width="180px" padding={'8px 12px'} flexDirection={'column'}>
      <Typography fontWeight={600}>{buttonLabel}</Typography>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
        <DesktopDatePicker
          onChange={(newValue: string | null) => onChangeValue(newValue)}
          value={value}
          renderInput={(params) => <TextField {...params} className={classes.datePickerInput} />}
          // TODO: apres maj MUI, remplacer par slotProps et en profiter pour ajouter l'annulation
        />
      </LocalizationProvider>
    </Box>
  )
}

export default DatePicker
