import React, { useEffect, useState } from 'react'
import { FormLabel, Grid, IconButton, InputAdornment, TextField } from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import ClearIcon from '@mui/icons-material/Clear'
import moment from 'moment'
import { DatePickerWrapper, DateWrapper } from './styles'
import { BlockWrapper } from 'components/ui/Layout/styles'
import { ErrorType } from 'types/error'
import { ErrorMessage } from '../Errors/styles'

interface CalendarInputProps {
  value: string | null
  label: string
  disabled?: boolean
  onChange: (date: string | null) => void
}

const CalendarInput = ({ value, label, disabled = false, onChange }: CalendarInputProps) => {
  const [date, setDate] = useState(value)
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    setError({ isError: false, errorMessage: '' })
    if (moment(date).isValid()) {
      onChange(moment(date as string).format('YYYY-MM-DD'))
    } else {
      if (date === null) onChange(null)
      else setError({ isError: true, errorMessage: 'La date sélectionnée est invalide.' })
    }
  }, [date])

  return (
    <>
      <DateWrapper item xs={12}>
        <FormLabel component="legend">{label} :</FormLabel>
        <Grid container alignItems="center">
          <Grid container item xs={date ? 11 : 12} justifyContent="space-between">
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
              <DatePickerWrapper
                disabled={disabled}
                onChange={(newValue: unknown) => setDate(newValue as string)}
                value={date}
                renderInput={(params: any) => <TextField {...params} variant="standard" />}
              >
                <InputAdornment position="start">
                  <ClearIcon color="primary" onClick={() => setDate(null)} />{' '}
                </InputAdornment>
              </DatePickerWrapper>
            </LocalizationProvider>
          </Grid>
          {date !== null && (
            <Grid item xs={1}>
              <IconButton color="primary" size="small">
                <ClearIcon style={{ fontSize: 17 }} onClick={() => setDate(null)} />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </DateWrapper>
      <BlockWrapper>
        <ErrorMessage>{error.errorMessage}</ErrorMessage>
      </BlockWrapper>
    </>
  )
}

export default CalendarInput
