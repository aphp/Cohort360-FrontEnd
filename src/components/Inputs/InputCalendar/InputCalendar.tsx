import React from 'react'
import { FormLabel, IconButton, TextField } from '@mui/material'

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import ClearIcon from '@mui/icons-material/Clear'
import useStyles from './styles'

interface InputCalendarProps {
  label?: string
  error: boolean
  onclick: (date: string | null) => void | ((key: string, value: string | null) => void)
  date?: string
}

const InputCalendar = ({ label, error, date, onclick }: InputCalendarProps) => {
  const { classes } = useStyles()
  return (
    <>
      {label && (
        <FormLabel component="legend" className={classes.dateLabel}>
          {label}
        </FormLabel>
      )}
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
        <DatePicker
          onChange={(date) => onclick(date ?? null)}
          value={date}
          renderInput={(params: any) => (
            <TextField {...params} variant="standard" error={error} style={{ width: 'calc(100% - 120px)' }} />
          )}
        />
      </LocalizationProvider>
      {date !== null && (
        <IconButton classes={{ root: classes.clearDate }} color="primary" onClick={() => onclick(null)}>
          <ClearIcon />
        </IconButton>
      )}
    </>
  )
}

export default InputCalendar
