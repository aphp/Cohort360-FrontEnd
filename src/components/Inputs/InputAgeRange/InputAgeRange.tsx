import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { useAppSelector } from 'state'

import { Grid, TextField, Typography } from '@mui/material'
import useStyles from './styles'

type InputAgeRangeAdvancedProps = {
  birthdates: [string, string]
  onChangeBirthdates: (newAge: [string, string]) => void
  error: boolean
  setError: (error: boolean) => void
}
type InputsStateType = {
  year?: number
  month?: number
  days?: number
}
const InputAgeRange: React.FC<InputAgeRangeAdvancedProps> = ({ birthdates, onChangeBirthdates, error, setError }) => {
  const classes = useStyles()
  const { deidentifiedBoolean = true } = useAppSelector((state) => state.exploredCohort)

  const [minState, setMinState] = useState<InputsStateType>({
    year: 0,
    month: 0,
    days: 0
  })
  const [maxState, setMaxState] = useState<InputsStateType>({
    year: 0,
    month: 0,
    days: 0
  })

  useEffect(() => {
    const newMaxDate: InputsStateType = {
      year: 0,
      month: 0,
      days: 0
    }
    const newMinDate: InputsStateType = {
      year: 0,
      month: 0,
      days: 0
    }

    newMaxDate.year = moment().diff(moment(birthdates[0], 'YYYY-MM-DD'), 'year') || 0
    newMaxDate.month = moment().subtract(newMaxDate.year, 'year').diff(moment(birthdates[0], 'YYYY-MM-DD'), 'month')
    newMaxDate.days = moment()
      .subtract(newMaxDate.year, 'year')
      .subtract(newMaxDate.month, 'month')
      .diff(moment(birthdates[0], 'YYYY-MM-DD'), 'days')

    newMinDate.year = moment().diff(moment(birthdates[1], 'YYYY-MM-DD'), 'year') || 0
    newMinDate.month = moment().subtract(newMinDate.year, 'year').diff(moment(birthdates[1], 'YYYY-MM-DD'), 'month')
    newMinDate.days = moment()
      .subtract(newMinDate.year, 'year')
      .subtract(newMinDate.month, 'month')
      .diff(moment(birthdates[1], 'YYYY-MM-DD'), 'days')

    setMinState(newMinDate)
    setMaxState(newMaxDate)
  }, [birthdates])

  useEffect(() => {
    if (maxState.days === 0 && maxState.month === 0 && maxState.year === 0) {
      setError(true)
    } else {
      setError(false)
    }
  }, [maxState])

  const _onChangeState = (stateName: 'minState' | 'maxState', key: 'year' | 'month' | 'days', value?: number) => {
    const _minState = minState
    const _maxState = maxState

    if (stateName === 'minState') {
      _minState[key] = value
      setMinState(_minState)
    } else {
      _maxState[key] = value
      setMaxState(_maxState)
    }
    const newMinDate = moment()
      .subtract(_minState.days, 'days')
      .subtract(_minState.month, 'month')
      .subtract(_minState.year, 'year')
      .format('YYYY-MM-DD')
    const newMaxDate = moment()
      .subtract(_maxState.days, 'days')
      .subtract(_maxState.month, 'month')
      .subtract(_maxState.year, 'year')
      .format('YYYY-MM-DD')

    if (birthdates[1] !== newMinDate || birthdates[0] !== newMaxDate) {
      onChangeBirthdates([newMaxDate, newMinDate] as [string, string])
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

        {error && (
          <Typography style={{ color: '#f44336', marginTop: 4 }}>
            Au moins une des valeurs maximales ne doit pas être égale à 0.
          </Typography>
        )}
      </div>
    </>
  )
}

export default InputAgeRange
