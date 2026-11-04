import React, { useState } from 'react'
import { FormLabel, Grid, IconButton } from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import { DateWrapper } from './styles'
import DateInput from '../DateInput'

interface CalendarInputProps {
  value: string | null
  label: string
  disabled?: boolean
  error?: string
  onChange: (date: string | null) => void
  onIncomplete: (isIncomplete: boolean) => void
}

const CalendarInput = (props: CalendarInputProps) => {
  const { value, label, disabled = false, error, onChange, onIncomplete } = props
  const [date, setDate] = useState(value)
  const [isIncomplete, setIsIncomplete] = useState(false)
  // DateInput reads its value on mount only: a new key empties it
  const [inputKey, setInputKey] = useState(0)
  const hasDate = date !== null || isIncomplete

  const handleIncomplete = (newIsIncomplete: boolean) => {
    setIsIncomplete(newIsIncomplete)
    onIncomplete(newIsIncomplete)
  }

  const handleChange = (newDate: string | null) => {
    setDate(newDate)
    onChange(newDate)
  }

  const handleClear = () => {
    setInputKey((key) => key + 1)
    handleIncomplete(false)
    handleChange(null)
  }

  return (
    <DateWrapper size={12}>
      <FormLabel component="legend">{label} :</FormLabel>
      <Grid container sx={{ alignItems: 'center' }}>
        <Grid container size={hasDate ? 11 : 12} sx={{ justifyContent: 'space-between' }}>
          <DateInput
            key={inputKey}
            variant="standard"
            defaultValue={value}
            disabled={disabled}
            error={error}
            onChange={handleChange}
            onIncomplete={handleIncomplete}
          />
        </Grid>
        {hasDate && (
          <Grid size={1}>
            <IconButton color="primary" size="small" onClick={handleClear} disabled={disabled}>
              <ClearIcon style={{ fontSize: 17 }} data-testid="ClearIcon" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </DateWrapper>
  )
}

export default CalendarInput
