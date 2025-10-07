import React, { useEffect, useState } from 'react'
import { FormLabel, Grid, IconButton } from '@mui/material'

import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import ClearIcon from '@mui/icons-material/Clear'
import moment from 'moment'
import { DatePickerWrapper, DateWrapper } from './styles'
import { BlockWrapper } from 'components/ui/Layout'
import { ErrorType } from 'types/error'
import { ErrorMessage } from '../Errors'
import { frFR } from '@mui/x-date-pickers/locales'

interface CalendarInputProps {
  value: string | null
  label: string
  disabled?: boolean
  onChange: (date: string | null) => void
}

const CalendarInput = ({ value, label, disabled = false, onChange }: CalendarInputProps) => {
  const [date, setDate] = useState<moment.Moment | null>(value ? moment(value) : null)
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    setError({ isError: false, errorMessage: '' })
    if (date && moment(date).isValid()) {
      onChange(moment(date).format('YYYY-MM-DD'))
    } else {
      if (date === null) onChange(null)
      else setError({ isError: true, errorMessage: 'La date sélectionnée est invalide.' })
    }
  }, [date])

  return (
    <>
      <DateWrapper size={12}>
        <FormLabel component="legend">{label} :</FormLabel>
        <Grid container sx={{ alignItems: 'center' }}>
          <Grid container size={date ? 11 : 12} sx={{ justifyContent: 'space-between' }}>
            <LocalizationProvider
              dateAdapter={AdapterMoment}
              adapterLocale={'fr'}
              localeText={frFR.components.MuiLocalizationProvider.defaultProps.localeText}
            >
              <DatePickerWrapper
                disabled={disabled}
                onChange={(newValue: moment.Moment | null) => setDate(newValue)}
                value={date}
                slotProps={{
                  textField: {
                    variant: 'standard'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          {date !== null && (
            <Grid size={1}>
              <IconButton color="primary" size="small" onClick={() => setDate(null)} disabled={disabled}>
                <ClearIcon style={{ fontSize: 17 }} />
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
