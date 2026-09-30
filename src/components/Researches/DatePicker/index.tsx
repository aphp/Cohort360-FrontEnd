import React, { useState } from 'react'
import moment, { Moment } from 'moment'

import { Box, Typography } from '@mui/material'

import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { frFR } from '@mui/x-date-pickers/locales'
import useStyles from '../DatePicker/styles'
import { ISO_DATE_FORMAT, toIsoDate } from 'utils/dates'

type DatePickerProps = {
  buttonLabel: string
  defaultValue: string | null
  onChangeValue: (newValue: string | null) => void
}

// AdapterMoment needs a Moment, a raw string crashes the picker
const DatePicker: React.FC<DatePickerProps> = ({ buttonLabel, defaultValue, onChangeValue }) => {
  const { classes } = useStyles()

  const [date, setDate] = useState<Moment | null>(() =>
    defaultValue ? moment(defaultValue, ISO_DATE_FORMAT, true) : null
  )

  const handleChange = (newDate: Moment | null) => {
    setDate(newDate)
    onChangeValue(toIsoDate(newDate))
  }

  return (
    <Box display="flex" width="180px" padding={'8px 12px'} flexDirection={'column'}>
      <Typography fontWeight={600}>{buttonLabel}</Typography>
      <LocalizationProvider
        dateAdapter={AdapterMoment}
        adapterLocale={'fr'}
        localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <DesktopDatePicker
          onChange={handleChange}
          value={date}
          slotProps={{
            textField: {
              fullWidth: true,
              className: classes.datePickerInput
            },
            field: { clearable: true }
          }}
        />
      </LocalizationProvider>
    </Box>
  )
}

export default DatePicker
