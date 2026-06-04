import React from 'react'

import { Box, Typography } from '@mui/material'

import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { frFR } from '@mui/x-date-pickers/locales'
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
      <LocalizationProvider
        dateAdapter={AdapterMoment}
        adapterLocale={'fr'}
        localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <DesktopDatePicker
          onChange={(newValue) => onChangeValue(newValue as string | null)}
          value={value as any}
          slotProps={{
            textField: {
              fullWidth: true,
              className: classes.datePickerInput
            },
            field: { clearable: true, onClear: () => onChangeValue(null) }
          }}
        />
      </LocalizationProvider>
    </Box>
  )
}

export default DatePicker
