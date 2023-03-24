import React, { useEffect, useState } from 'react'

import { useAppSelector } from 'state'

import { Grid, TextField, Typography } from '@material-ui/core'
import useStyles from './styles'
import { AgeRangeType, ErrorType } from 'types'
import { convertAgeRangeTypeToString, convertStringToAgeRangeType, substructAgeRangeType } from 'utils/age'

type InputAgeRangeAdvancedProps = {
  birthdatesRanges: [string, string]
  onChangeBirthdatesRanges: (newAge: [string, string]) => void
  error: ErrorType
  onError: (isError: boolean, errorMessage?: string) => void
}
const defaultMinDate: AgeRangeType = {
  year: 0,
  month: 0,
  days: 0
}
const defaultMaxDate: AgeRangeType = {
  year: 130,
  month: 0,
  days: 0
}
const InputAgeRange: React.FC<InputAgeRangeAdvancedProps> = ({
  birthdatesRanges,
  onChangeBirthdatesRanges,
  error,
  onError
}) => {
  const classes = useStyles()
  const { deidentifiedBoolean = true } = useAppSelector((state) => state.exploredCohort)

  const [minState, setMinState] = useState<AgeRangeType>(defaultMinDate)
  const [maxState, setMaxState] = useState<AgeRangeType>(defaultMaxDate)

  useEffect(() => {
    const newMaxDate: AgeRangeType = convertStringToAgeRangeType(birthdatesRanges[0]) ?? defaultMaxDate
    const newMinDate: AgeRangeType = convertStringToAgeRangeType(birthdatesRanges[1]) ?? defaultMinDate
    setMinState(newMinDate)
    setMaxState(newMaxDate)
  }, [birthdatesRanges])

  const checkRange = (key: string, value: number) => {
    if (key === 'days' && value <= 31 && value >= 0) {
      return true
    } else if (key === 'month' && value <= 12 && value >= 0) {
      return true
    } else if (key === 'year' && value >= 0) {
      return true
    }
    return false
  }

  const _onChangeState = (stateName: 'minState' | 'maxState', key: 'year' | 'month' | 'days', value = 0) => {
    const newMinState: AgeRangeType = { ...minState }
    const newMaxState: AgeRangeType = { ...maxState }
    let isError
    if (!checkRange(key, value)) {
      isError = true
    } else {
      if (stateName === 'minState') {
        newMinState[key] = value
      } else {
        newMaxState[key] = value
      }

      const maxDate: Date = substructAgeRangeType(newMinState)
      const minDate: Date = substructAgeRangeType(newMaxState)

      if (minDate > maxDate) {
        onError(true, 'La date maximale doit être supérieure à la date minimale.')
        isError = true
      } else if (newMaxState.days === 0 && newMaxState.month === 0 && newMaxState.year === 0) {
        onError(true, 'Au moins une des valeurs maximales ne doit pas être égale à 0')
        isError = true
      }
    }
    const oldBirthdatesRanges: [string, string] = [
      convertAgeRangeTypeToString(maxState),
      convertAgeRangeTypeToString(minState)
    ]
    const newBirthdatesRanges: [string, string] = [
      convertAgeRangeTypeToString(newMaxState),
      convertAgeRangeTypeToString(newMinState)
    ]

    if (isError) {
      onChangeBirthdatesRanges(oldBirthdatesRanges)
    } else if (birthdatesRanges[1] !== newBirthdatesRanges[1] || birthdatesRanges[0] !== newBirthdatesRanges[0]) {
      onError(false)
      if (stateName === 'minState') {
        setMinState(newMinState)
      } else {
        setMaxState(newMaxState)
      }
      onChangeBirthdatesRanges(newBirthdatesRanges)
    }
  }

  return (
    <>
      <div className={classes.ageFilter}>
        <Typography variant="h3">Âge :</Typography>

        <Grid container alignItems="center">
          <Typography style={{ width: 35, margin: '0 4px' }}>De : </Typography>
          <Grid item style={{ flex: 0.3, margin: `0 ${deidentifiedBoolean ? '12px' : '4px'}` }}>
            <TextField
              InputProps={{
                endAdornment: <Typography>an(s)</Typography>
              }}
              value={minState.year}
              type="number"
              onChange={(e) => _onChangeState('minState', 'year', e.target.value ? +e.target.value : undefined)}
            />
          </Grid>
          <Grid item style={{ flex: 0.3, margin: `0 ${deidentifiedBoolean ? '12px' : '4px'}` }}>
            <TextField
              InputProps={{
                endAdornment: <Typography>mois</Typography>
              }}
              value={minState.month}
              type="number"
              onChange={(e) => _onChangeState('minState', 'month', e.target.value ? +e.target.value : undefined)}
            />
          </Grid>
          {!deidentifiedBoolean && (
            <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
              <TextField
                InputProps={{
                  endAdornment: <Typography>jour(s)</Typography>
                }}
                value={minState.days}
                type="number"
                onChange={(e) => _onChangeState('minState', 'days', e.target.value ? +e.target.value : undefined)}
              />
            </Grid>
          )}
        </Grid>

        <Grid container alignItems="center">
          <Typography style={{ width: 35, margin: '0 4px' }}>À : </Typography>
          <Grid item style={{ flex: 0.3, margin: `0 ${deidentifiedBoolean ? '12px' : '4px'}` }}>
            <TextField
              InputProps={{
                endAdornment: <Typography>an(s)</Typography>
              }}
              value={maxState.year}
              type="number"
              onChange={(e) => _onChangeState('maxState', 'year', e.target.value ? +e.target.value : undefined)}
            />
          </Grid>
          <Grid item style={{ flex: 0.3, margin: `0 ${deidentifiedBoolean ? '12px' : '4px'}` }}>
            <TextField
              InputProps={{
                endAdornment: <Typography>mois</Typography>
              }}
              value={maxState.month}
              type="number"
              onChange={(e) => _onChangeState('maxState', 'month', e.target.value ? +e.target.value : undefined)}
            />
          </Grid>
          {!deidentifiedBoolean && (
            <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
              <TextField
                InputProps={{
                  endAdornment: <Typography>jour(s)</Typography>
                }}
                value={maxState.days}
                type="number"
                onChange={(e) => _onChangeState('maxState', 'days', e.target.value ? +e.target.value : undefined)}
              />
            </Grid>
          )}
        </Grid>

        {error.isError && (
          <Grid direction={'column'}>
            <Typography style={{ color: '#f44336', marginTop: 4 }}>{error.errorMessage}</Typography>
          </Grid>
        )}
      </div>
    </>
  )
}

export default InputAgeRange
