import React, { ReactNode, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import moment from 'moment'
import CalendarInput from './CalendarInput'
import { BlockWrapper } from 'components/ui/Layout'
import { ErrorMessage } from '../Errors'
import { ErrorType } from 'types/error'
import { DurationRangeType } from 'types/searchCriterias'
import { CalendarLabel } from './styles'
import { isString } from 'lodash'

interface CalendarRangeProps {
  value: DurationRangeType
  label?: ReactNode
  inline?: boolean
  disabled?: boolean
  onChange: (newDuration: DurationRangeType, includeNullValues: boolean) => void
  onError: (isError: boolean) => void
  includeNullValues?: boolean
  onChangeIncludeNullValues?: (includeNullValues: boolean) => void
}

const CalendarRange = ({
  value,
  label,
  inline = false,
  onError,
  disabled = false,
  onChange,
  includeNullValues = false,
  onChangeIncludeNullValues
}: CalendarRangeProps) => {
  const [startDate, setStartDate] = useState(value[0])
  const [endDate, setEndDate] = useState(value[1])
  const [isNullValuesChecked, setIsNullValuesChecked] = useState(includeNullValues)

  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    onError(false)
    setError({ isError: false, errorMessage: '' })
    if (moment(startDate).isAfter(moment(endDate))) {
      setError({ isError: true, errorMessage: 'La date maximale doit être supérieure à la date minimale.' })
      onError(true)
    } else {
      onChange([startDate, endDate], isNullValuesChecked)
      if (onChangeIncludeNullValues) {
        onChangeIncludeNullValues(isNullValuesChecked)
      }
    }
  }, [startDate, endDate, isNullValuesChecked])

  return (
    <>
      {isString(label) ? (
        <BlockWrapper size={{ xs: 12 }} margin="0px 0px 10px 0px">
          <CalendarLabel variant="h3">{label}</CalendarLabel>
        </BlockWrapper>
      ) : (
        label
      )}
      <Grid size={{ xs: 12 }} container spacing={2}>
        <Grid size={{ xs: 12, md: inline ? 6 : 12 }}>
          <CalendarInput
            disabled={disabled}
            label="Après le"
            value={startDate || null}
            onChange={(value) => setStartDate(value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: inline ? 6 : 12 }}>
          <CalendarInput
            disabled={disabled}
            label="Avant le"
            value={endDate || null}
            onChange={(value) => setEndDate(value)}
          />
        </Grid>
      </Grid>
      {onChangeIncludeNullValues &&
        ((startDate !== '' && startDate !== null) || (endDate !== '' && endDate !== null)) && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isNullValuesChecked}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsNullValuesChecked(event.target.checked)}
                style={{ padding: '4px 9px' }}
              />
            }
            label="Inclure les valeurs non renseignées"
          />
        )}
      {error.isError && (
        <BlockWrapper margin="10px 0px">
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </BlockWrapper>
      )}
    </>
  )
}

export default CalendarRange
