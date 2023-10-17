import React, { useEffect, useState } from 'react'
import { Grid } from '@mui/material'

import moment from 'moment'
import CalendarInput from './CalendarInput'
import { BlockWrapper } from 'components/ui/Layout/styles'
import { ErrorMessage } from '../Errors/styles'
import { ErrorType } from 'types/error'
import { DurationRangeType } from 'types/searchCriterias'
import { CalendarLabel } from './styles'

interface CalendarRangeProps {
  value: DurationRangeType
  label?: string
  inline?: boolean
  disabled?: boolean
  onChange: (newDuration: DurationRangeType) => void
  onError: (isError: boolean) => void
}

const CalendarRange = ({ value, label, inline = false, onError, disabled = false, onChange }: CalendarRangeProps) => {
  const [startDate, setStartDate] = useState(value[0])
  const [endDate, setEndDate] = useState(value[1])
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    onError(false)
    setError({ isError: false, errorMessage: '' })
    if (moment(startDate).isAfter(moment(endDate))) {
      setError({ isError: true, errorMessage: 'La date maximale doit être supérieure à la date minimale.' })
      onError(true)
    } else {
      onChange([startDate, endDate])
    }
  }, [startDate, endDate])

  return (
    <BlockWrapper>
      {label && (
        <BlockWrapper item xs={12} margin="0px 0px 10px 0px">
          <CalendarLabel disabled={disabled} variant="h3">
            {label} :
          </CalendarLabel>
        </BlockWrapper>
      )}
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={12} md={inline ? 6 : 12}>
          <CalendarInput
            disabled={disabled}
            label="Après le"
            value={startDate}
            onChange={(value) => setStartDate(value)}
          />
        </Grid>
        <Grid item xs={12} md={inline ? 6 : 12}>
          <CalendarInput disabled={disabled} label="Avant le" value={endDate} onChange={(value) => setEndDate(value)} />
        </Grid>
      </Grid>
      {error.isError && (
        <BlockWrapper margin="10px 0px">
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </BlockWrapper>
      )}
    </BlockWrapper>
  )
}

export default CalendarRange
