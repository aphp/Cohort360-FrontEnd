import React from 'react'

import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

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
          renderInput={(params) => (
            <div>
              <TextField
                {...params}
                fullWidth
                className={classes.datePickerInput}
                InputProps={{
                  ...params.InputProps,
                  placeholder: 'jj/mm/aaaa',
                  endAdornment: (
                    // TODO: apres maj MUI, remplacer par slotProps le delete custom degueu
                    <InputAdornment position="end">
                      {value && (
                        <IconButton sx={{ marginRight: '-12px', padding: 0 }} onClick={() => onChangeValue(null)}>
                          <ClearIcon sx={{ color: '#5bc5f2' }} />
                        </IconButton>
                      )}
                      {params.InputProps?.endAdornment}
                    </InputAdornment>
                  )
                }}
              />
            </div>
          )}
        />
      </LocalizationProvider>
    </Box>
  )
}

export default DatePicker
