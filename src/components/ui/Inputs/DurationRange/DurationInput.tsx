import React, { useEffect, useState } from 'react'

import { Grid } from '@mui/material'
import { DurationUnitWrapper, DurationLegendWrapper, TextFieldWrapper } from './styles'
import { DurationType, CalendarRequestLabel } from 'types/dates'
import { BlockWrapper } from 'components/ui/Layout'

type DurationProps = {
  value: DurationType
  label: string
  disabled?: boolean
  deidentified?: boolean
  onChange: (newDuration: DurationType) => void
  name?: string
}

const DurationInput = ({ value, label, deidentified = false, disabled = false, onChange, name }: DurationProps) => {
  const [duration, setDuration] = useState(value)

  useEffect(() => {
    onChange(duration)
  }, [duration])

  return (
    <BlockWrapper container justifyContent="space-between" xs={12} alignItems="flex-end">
      <Grid item xs={deidentified ? 4 : 3} container alignItems="flex-start">
        <DurationLegendWrapper variant="h5">{label}</DurationLegendWrapper>
      </Grid>
      <Grid item xs={deidentified ? 8 : 9} container justifyContent="space-between">
        <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
          <Grid item xs={6}>
            <TextFieldWrapper
              active={!disabled && !!duration.year}
              disabled={disabled}
              placeholder={duration.year ? undefined : name === 'max' ? '130' : '0'}
              value={duration.year}
              variant="standard"
              type={disabled || !!duration.year ? 'text' : 'number'}
              InputProps={{
                inputProps: {
                  min: 0
                }
              }}
              size="small"
              onChange={(e) => {
                if (!isNaN(+e.target.value) && +e.target.value <= 130) {
                  setDuration({ ...duration, year: e.target.value !== '' ? +e.target.value : null })
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DurationUnitWrapper active={!disabled && !!duration.year}>{CalendarRequestLabel.YEAR}</DurationUnitWrapper>
          </Grid>
        </Grid>
        <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
          <Grid item xs={6}>
            <TextFieldWrapper
              active={!disabled && !!duration.month}
              disabled={disabled}
              value={duration.month ? duration.month : undefined}
              placeholder={duration.month ? undefined : '0'}
              variant="standard"
              type={disabled || !!duration.month ? 'text' : 'number'}
              InputProps={{
                inputProps: {
                  min: 0
                }
              }}
              size="small"
              onChange={(e) => {
                if (!isNaN(+e.target.value) && +e.target.value <= 12) {
                  setDuration({ ...duration, month: e.target.value !== '' ? +e.target.value : null })
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DurationUnitWrapper active={!disabled && !!duration.month}>
              {CalendarRequestLabel.MONTH}
            </DurationUnitWrapper>
          </Grid>
        </Grid>
        {!deidentified && (
          <Grid container item xs={3} alignItems="center">
            <Grid item xs={6}>
              <TextFieldWrapper
                active={!disabled && !!duration.day}
                disabled={disabled}
                value={duration.day ? duration.day : undefined}
                placeholder={duration.day ? undefined : '0'}
                variant="standard"
                type={disabled || !!duration.day ? 'text' : 'number'}
                InputProps={{
                  inputProps: {
                    min: 0
                  }
                }}
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 31) {
                    setDuration({ ...duration, day: e.target.value !== '' ? +e.target.value : null })
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DurationUnitWrapper active={!disabled && !!duration.day}>{CalendarRequestLabel.DAY}</DurationUnitWrapper>
            </Grid>
          </Grid>
        )}
      </Grid>
    </BlockWrapper>
  )
}

export default DurationInput
