import React, { useEffect, useState } from 'react'

import { Grid, Typography } from '@mui/material'
import { AgeUnitWrapper, DurationLegendWrapper, ErrorMessage, TextFieldWrapper } from './styles'
import { checkMinMaxValue, convertAgeRangeTypeToString, convertStringToAgeRangeType } from 'utils/age'
import { DateRange } from 'types/searchCriterias'
import { AgeRangeType, CalendarRequestLabel } from 'types/dates'
import { ErrorType } from 'types/error'
import { BlockWrapper } from 'components/ui/Layout/styles'
import { isEqual } from 'lodash'

type InputAgeRangeAdvancedProps = {
  value: DateRange
  label: string
  deidentified?: boolean
  onChange: (newAge: DateRange) => void
  onError: (isError: boolean) => void
}
const defaultMinDate: AgeRangeType = {
  year: 0,
  month: null,
  day: null
}
const defaultMaxDate: AgeRangeType = {
  year: 130,
  month: null,
  day: null
}
const InputAgeRange: React.FC<InputAgeRangeAdvancedProps> = ({
  value,
  label,
  deidentified = false,
  onChange,
  onError
}) => {
  const [minAgeRange, setMinAgeRange] = useState<AgeRangeType>(convertStringToAgeRangeType(value[0]) || defaultMinDate)
  const [maxAgeRange, setMaxAgeRange] = useState<AgeRangeType>(convertStringToAgeRangeType(value[1]) || defaultMaxDate)
  const [error, setError] = useState<ErrorType>({ isError: false, errorMessage: '' })

  useEffect(() => {
    setError({ isError: false, errorMessage: '' })
    onError(false)
    if (!checkMinMaxValue(minAgeRange, maxAgeRange)) {
      setError({ isError: true, errorMessage: 'La date maximale doit être supérieure à la date minimale.' })
      onError(true)
    } else if (maxAgeRange.year === 0 && !maxAgeRange.month && !maxAgeRange.day) {
      setError({ isError: true, errorMessage: 'Au moins une des valeurs maximales ne doit pas être égale à 0' })
      onError(true)
    } else {
      onChange([convertAgeRangeTypeToString(minAgeRange), convertAgeRangeTypeToString(maxAgeRange)])
    }
  }, [minAgeRange, maxAgeRange])

  return (
    <BlockWrapper>
      <Typography variant="h3">{label} :</Typography>
      <BlockWrapper
        container
        justifyContent="space-between"
        xs={deidentified ? 6 : 10}
        alignItems="center"
        margin={'15px 0px 0px 0px'}
      >
        <Grid item xs={1} container alignItems="flex-start">
          <DurationLegendWrapper variant="h5">De</DurationLegendWrapper>
        </Grid>
        <Grid item xs={deidentified ? 10 : 11} container justifyContent="space-around">
          <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
            <Grid item xs={6}>
              <TextFieldWrapper
                active
                value={minAgeRange.year}
                variant="standard"
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 130) {
                    setMinAgeRange({ ...minAgeRange, year: +e.target.value })
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <AgeUnitWrapper active={minAgeRange.year !== null}>{CalendarRequestLabel.YEAR}</AgeUnitWrapper>
            </Grid>
          </Grid>
          <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
            <Grid item xs={6}>
              <TextFieldWrapper
                active={!!minAgeRange.month}
                value={minAgeRange.month ? minAgeRange.month : undefined}
                placeholder={minAgeRange.month ? undefined : '0'}
                variant="standard"
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 12) {
                    setMinAgeRange({ ...minAgeRange, month: +e.target.value })
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <AgeUnitWrapper active={!!minAgeRange.month}>{CalendarRequestLabel.MONTH}</AgeUnitWrapper>
            </Grid>
          </Grid>
          {!deidentified && (
            <Grid container item xs={3} alignItems="center">
              <Grid item xs={6}>
                <TextFieldWrapper
                  active={!!minAgeRange.day}
                  value={minAgeRange.day ? minAgeRange.day : undefined}
                  placeholder={minAgeRange.day ? undefined : '0'}
                  variant="standard"
                  size="small"
                  onChange={(e) => {
                    if (!isNaN(+e.target.value) && +e.target.value <= 31) {
                      setMinAgeRange({ ...minAgeRange, day: +e.target.value })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <AgeUnitWrapper active={!!minAgeRange.day}>{CalendarRequestLabel.DAY}</AgeUnitWrapper>
              </Grid>
            </Grid>
          )}
        </Grid>
      </BlockWrapper>
      <BlockWrapper
        container
        justifyContent="space-between"
        xs={deidentified ? 6 : 10}
        alignItems="center"
        margin={'5px 0px'}
      >
        <Grid item xs={1} container alignItems="flex-start">
          <DurationLegendWrapper variant="h5">À</DurationLegendWrapper>
        </Grid>
        <Grid item xs={deidentified ? 10 : 11} container justifyContent="space-around">
          <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
            <Grid item xs={6}>
              <TextFieldWrapper
                active
                value={maxAgeRange.year}
                variant="standard"
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 130) {
                    setMaxAgeRange({ ...maxAgeRange, year: +e.target.value })
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <AgeUnitWrapper active={minAgeRange.year !== null}>{CalendarRequestLabel.YEAR}</AgeUnitWrapper>
            </Grid>
          </Grid>

          <Grid container item xs={deidentified ? 5 : 3} alignItems="center">
            <Grid item xs={6}>
              <TextFieldWrapper
                active={!!maxAgeRange.month}
                value={maxAgeRange.month ? maxAgeRange.month : undefined}
                placeholder={maxAgeRange.month ? undefined : '0'}
                variant="standard"
                size="small"
                onChange={(e) => {
                  if (!isNaN(+e.target.value) && +e.target.value <= 12) {
                    setMaxAgeRange({ ...maxAgeRange, month: +e.target.value })
                  }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <AgeUnitWrapper active={!!maxAgeRange.month}>{CalendarRequestLabel.MONTH}</AgeUnitWrapper>
            </Grid>
          </Grid>

          {!deidentified && (
            <Grid container item xs={3} alignItems="center">
              <Grid item xs={6}>
                <TextFieldWrapper
                  active={!!maxAgeRange.day}
                  value={maxAgeRange.day ? maxAgeRange.day : undefined}
                  placeholder={maxAgeRange.day ? undefined : '0'}
                  variant="standard"
                  size="small"
                  onChange={(e) => {
                    if (!isNaN(+e.target.value) && +e.target.value <= 31) {
                      setMaxAgeRange({ ...maxAgeRange, day: +e.target.value })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <AgeUnitWrapper active={!!maxAgeRange.day}>{CalendarRequestLabel.DAY}</AgeUnitWrapper>
              </Grid>
            </Grid>
          )}
        </Grid>
      </BlockWrapper>
      {error.isError && (
        <BlockWrapper margin="15px 0px">
          <ErrorMessage>{error.errorMessage}</ErrorMessage>
        </BlockWrapper>
      )}
    </BlockWrapper>
  )
}

export default InputAgeRange
