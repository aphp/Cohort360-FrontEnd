import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Grid, TextField, Typography } from '@material-ui/core'

import useStyle from './styles'

type InputAgeRangeAdvancedProps = {
  birthdates: [string, string]
  onChangeBirthdates: (newAge: [string, string]) => void
}
type InputsStateType = {
  year?: number
  month?: number
  days?: number
}
const InputAgeRangeAdvanced: React.FC<InputAgeRangeAdvancedProps> = ({ birthdates, onChangeBirthdates }) => {
  const classes = useStyle()
  const [minState, setMinState] = useState<InputsStateType>({})
  const [maxState, setMaxState] = useState<InputsStateType>({})

  useEffect(() => {
    const date1 = moment()
      .subtract(minState.days ?? 0, 'days')
      .subtract(minState.month ?? 0, 'month')
      .subtract(minState.year ?? 0, 'year')
      .format('YYYY-MM-DD')
    const date2 = moment()
      .subtract(maxState.days ?? 0, 'days')
      .subtract(maxState.month ?? 0, 'month')
      .subtract(maxState.year ?? 0, 'year')
      .format('YYYY-MM-DD')

    console.log(`[date1, date2]`, [date1, date2])
    onChangeBirthdates([date1, date2] as [string, string])
    return () => {
      setMinState({})
      setMaxState({})
    }
  }, [minState, maxState])

  const _onChangeState = (stateName: 'minState' | 'maxState', key: 'year' | 'month' | 'days', value?: number) => {
    if (stateName === 'minState') {
      setMinState((prevState) => ({
        ...prevState,
        [key]: value
      }))
    } else {
      setMaxState((prevState) => ({
        ...prevState,
        [key]: value
      }))
    }
  }

  return (
    <>
      <Typography variant="h3">Âge :</Typography>

      <Grid container>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en année(s)</Typography>
            }}
            value={minState.year}
            type="number"
            onChange={(e) => _onChangeState('minState', 'year', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en mois</Typography>
            }}
            value={minState.month}
            type="number"
            onChange={(e) => _onChangeState('minState', 'month', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en jour(s)</Typography>
            }}
            value={minState.month}
            type="number"
            onChange={(e) => _onChangeState('minState', 'month', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
      </Grid>

      <Grid container>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en année(s)</Typography>
            }}
            value={maxState.year}
            type="number"
            onChange={(e) => _onChangeState('maxState', 'year', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en mois</Typography>
            }}
            value={maxState.month}
            type="number"
            onChange={(e) => _onChangeState('maxState', 'month', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
        <Grid item style={{ flex: 0.3, margin: '0 4px' }}>
          <TextField
            InputProps={{
              endAdornment: <Typography>en jour(s)</Typography>
            }}
            value={maxState.month}
            type="number"
            onChange={(e) => _onChangeState('maxState', 'month', e.target.value ? +e.target.value : undefined)}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default InputAgeRangeAdvanced
