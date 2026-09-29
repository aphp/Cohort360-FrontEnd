import React, { useState } from 'react'
import moment, { Moment } from 'moment'

import { Box, Typography } from '@mui/material'

import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { frFR } from '@mui/x-date-pickers/locales'
import useStyles from '../DatePicker/styles'

const DATE_FORMAT = 'YYYY-MM-DD'

type DatePickerProps = {
  buttonLabel: string
  value: string | null
  onChangeValue: (newValue: string | null) => void
}

/**
 * Takes and emits `YYYY-MM-DD` strings, but keeps a `Moment` internally: AdapterMoment calls Moment
 * methods on the picker's value, so a raw string crashes it (`isValid is not a function`). The
 * internal state also keeps a half-typed (invalid) date in the field while `null` is emitted.
 */
const DatePicker: React.FC<DatePickerProps> = ({ buttonLabel, value, onChangeValue }) => {
  const { classes } = useStyles()

  const [date, setDate] = useState<Moment | null>(() => (value ? moment(value, DATE_FORMAT, true) : null))

  const handleChange = (newDate: Moment | null) => {
    setDate(newDate)
    onChangeValue(newDate?.isValid() ? newDate.format(DATE_FORMAT) : null)
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
            field: { clearable: true, onClear: () => handleChange(null) }
          }}
        />
      </LocalizationProvider>
    </Box>
  )
}

export default DatePicker
