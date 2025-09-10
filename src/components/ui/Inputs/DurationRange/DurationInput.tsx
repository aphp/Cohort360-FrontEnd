import React, { useEffect, useState } from 'react'

import { Grid } from '@mui/material'
import { DurationUnitWrapper, DurationLegendWrapper, TextFieldWrapper } from './styles'
import { DurationType, CalendarRequestLabel } from 'types/dates'
import { BlockWrapper } from 'components/ui/Layout'

type DurationProps = {
  value: DurationType
  label: string
  disabled?: boolean
  includeDays?: boolean
  onChange: (newDuration: DurationType) => void
}

const DurationInput = ({ value, label, includeDays = true, disabled = false, onChange }: DurationProps) => {
  const [duration, setDuration] = useState(value)

  useEffect(() => {
    if (duration.year === 0 && duration.month === 0 && duration.day === 0) {
      setDuration({ ...duration, year: null, month: null, day: null })
    }
    onChange(duration)
  }, [duration])

  return (
    <BlockWrapper container sx={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <Grid size={!includeDays ? 4 : 3} container sx={{ alignItems: 'flex-start' }}>
        <DurationLegendWrapper variant="h5">{label}</DurationLegendWrapper>
      </Grid>
      <Grid size={!includeDays ? 8 : 9} container sx={{ justifyContent: 'space-between' }}>
        <Grid container size={!includeDays ? 5 : 3} sx={{ alignItems: 'center' }}>
          <Grid size={7}>
            <TextFieldWrapper
              activated={!disabled && !!duration.year}
              disabled={disabled}
              placeholder={'0'}
              value={duration.year}
              variant="standard"
              type={disabled ? 'text' : 'number'}
              InputProps={{
                inputProps: {
                  min: 0
                }
              }}
              size="small"
              onChange={(e) => {
                if (!isNaN(+e.target.value)) {
                  setDuration({
                    ...duration,
                    year: e.target.value !== '' ? Math.floor(Math.abs(+e.target.value)) : 0
                  })
                }
              }}
            />
          </Grid>
          <Grid size={5}>
            <DurationUnitWrapper activated={!disabled && !!duration.year}>
              {CalendarRequestLabel.YEAR}
            </DurationUnitWrapper>
          </Grid>
        </Grid>
        <Grid container size={!includeDays ? 5 : 3} sx={{ alignItems: 'center' }}>
          <Grid size={6}>
            <TextFieldWrapper
              activated={!disabled && !!duration.month}
              disabled={disabled}
              value={duration.month ? duration.month : undefined}
              placeholder={duration.month ? undefined : '0'}
              variant="standard"
              type={disabled ? 'text' : 'number'}
              InputProps={{
                inputProps: {
                  min: 0
                }
              }}
              size="small"
              onChange={(e) => {
                if (!isNaN(+e.target.value) && +e.target.value <= 12) {
                  setDuration({
                    ...duration,
                    month: e.target.value !== '' ? Math.floor(Math.abs(+e.target.value)) : 0
                  })
                }
              }}
            />
          </Grid>
          <Grid size={6}>
            <DurationUnitWrapper activated={!disabled && !!duration.month}>
              {CalendarRequestLabel.MONTH}
            </DurationUnitWrapper>
          </Grid>
        </Grid>
        {includeDays && (
          <Grid container size={3} sx={{ alignItems: 'center' }}>
            <Grid size={6}>
              <TextFieldWrapper
                activated={!disabled && !!duration.day}
                disabled={disabled}
                value={duration.day ? duration.day : undefined}
                placeholder={duration.day ? undefined : '0'}
                variant="standard"
                type={disabled ? 'text' : 'number'}
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 31) {
                    setDuration({
                      ...duration,
                      day: e.target.value !== '' ? Math.floor(Math.abs(+e.target.value)) : 0
                    })
                  }
                }}
              />
            </Grid>
            <Grid size={6}>
              <DurationUnitWrapper activated={!disabled && !!duration.day}>
                {CalendarRequestLabel.DAY}
              </DurationUnitWrapper>
            </Grid>
          </Grid>
        )}
      </Grid>
    </BlockWrapper>
  )
}

export default DurationInput
