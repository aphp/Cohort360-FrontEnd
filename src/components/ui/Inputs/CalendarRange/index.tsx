import React, { ReactNode, useEffect, useState } from 'react'
import { Checkbox, FormControlLabel, Grid } from '@mui/material'

import CalendarInput from './CalendarInput'
import { BlockWrapper } from 'components/ui/Layout'
import { DurationRangeType } from 'types/searchCriterias'
import { CalendarLabel } from './styles'
import { isString } from 'lodash'
import { DATE_ERROR_MESSAGES, isEndBeforeStart } from 'utils/dates'

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
  const [isStartIncomplete, setIsStartIncomplete] = useState(false)
  const [isEndIncomplete, setIsEndIncomplete] = useState(false)

  const endBeforeStart = isEndBeforeStart(startDate, endDate)

  useEffect(() => {
    const isError = endBeforeStart || isStartIncomplete || isEndIncomplete
    onError(isError)
    if (!isError) {
      onChange([startDate, endDate], isNullValuesChecked)
      if (onChangeIncludeNullValues) {
        onChangeIncludeNullValues(isNullValuesChecked)
      }
    }
  }, [startDate, endDate, isNullValuesChecked, isStartIncomplete, isEndIncomplete])

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
            onIncomplete={setIsStartIncomplete}
          />
        </Grid>
        <Grid size={{ xs: 12, md: inline ? 6 : 12 }}>
          <CalendarInput
            disabled={disabled}
            label="Avant le"
            value={endDate || null}
            error={endBeforeStart ? DATE_ERROR_MESSAGES.endBeforeStart : undefined}
            onChange={(value) => setEndDate(value)}
            onIncomplete={setIsEndIncomplete}
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
    </>
  )
}

export default CalendarRange
