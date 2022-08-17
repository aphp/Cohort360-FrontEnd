import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { useAppSelector } from 'state'

import { Grid, Slider, TextField, Typography } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import useStyle from './styles'

type InputAgeRangeSliderProps = {
  birthdates: [string, string]
  onChangeBirthdates: (newAge: [string, string]) => void
  error: boolean
  setError: (error: boolean) => void
}

const InputAgeRangeSlider: React.FC<InputAgeRangeSliderProps> = ({
  birthdates,
  onChangeBirthdates,
  error,
  setError
}) => {
  const classes = useStyle()
  const { deidentifiedBoolean = true } = useAppSelector((state) => state.exploredCohort)

  const [_age, setAge] = useState<[number, number]>([0, 130])
  const [_ageType, setAgeType] = useState<'year' | 'month' | 'days'>('year')

  const [limits, setLimits] = useState<[number, number]>([0, 130])

  useEffect(() => {
    const { age, ageType, limits } = convertToAgeAndType(birthdates)
    setAge(age)
    setAgeType(ageType)
    setLimits(limits)
  }, [birthdates])

  useEffect(() => {
    if (_age[0] === 0 && _age[1] === 0) {
      setError(true)
    } else {
      setError(false)
    }
  }, [_age])

  const convertToAgeAndType = (_birthdates: [string, string]) => {
    // newAge: [number, number], newAgeType: 'year' | 'month' | 'days'
    const result: { age: [number, number]; ageType: 'year' | 'month' | 'days'; limits: [number, number] } = {
      age: [0, 130],
      ageType: 'year',
      limits: [0, 130]
    }

    const current = moment()
    const date1 = moment(_birthdates[0])
    const date2 = moment(_birthdates[1])

    // Si date1 && date2 au dessus de 31 jours => ageType = 'month'
    if (!deidentifiedBoolean) {
      if (current.diff(date1, 'days') <= 31 && current.diff(date2, 'days') <= 31) {
        result.ageType = 'days'
      }
    }
    // Sinon si date1 && date2 au dessus de 24 mois =< ageType = 'year'
    else if (current.diff(date1, 'month') <= 24 && current.diff(date2, 'month') <= 24) {
      result.ageType = 'month'
    }
    result.age = [+current.diff(date2, result.ageType), +current.diff(date1, result.ageType)]

    switch (result.ageType) {
      case 'days':
        result.limits = [0, 31]
        break
      case 'month':
        result.limits = [0, 24]
        break
      case 'year':
      default:
        result.limits = [0, 130]
        break
    }

    return result
  }

  const convertToBirthdate = (newAge: [number, number], newAgeType: 'year' | 'month' | 'days') => {
    const date1 = moment().subtract(newAge[1], newAgeType).format('YYYY-MM-DD')
    const date2 = moment().subtract(newAge[0], newAgeType).format('YYYY-MM-DD')

    return [date1, date2] as [string, string]
  }

  const _onChangeAge = (event: React.ChangeEvent<{}>, value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setAge([value[0], value[1]])
      if (onChangeBirthdates && typeof onChangeBirthdates === 'function') {
        onChangeBirthdates(convertToBirthdate([value[0], value[1]], _ageType))
      }
    }
  }

  const _onChangeAgeType = (newAgeType: 'year' | 'month' | 'days') => {
    setAgeType(newAgeType)

    const newAge = _age as [number, number]

    switch (newAgeType) {
      case 'days':
        setLimits([0, 31])
        newAge[1] = newAge[1] > 31 ? 31 : newAge[1]
        break
      case 'month':
        setLimits([0, 24])
        newAge[1] = newAge[1] > 24 ? 24 : newAge[1]
        break
      case 'year':
      default:
        setLimits([0, 130])
        newAge[1] = newAge[1] > 130 ? 30 : newAge[1]
        break
    }
    setAge(newAge)

    if (onChangeBirthdates && typeof onChangeBirthdates === 'function') {
      onChangeBirthdates(convertToBirthdate(newAge, newAgeType))
    }
  }

  const ageTypeList = deidentifiedBoolean
    ? [
        { id: 'year', label: 'années' },
        { id: 'month', label: 'mois' }
      ]
    : [
        { id: 'year', label: 'années' },
        { id: 'month', label: 'mois' },
        { id: 'days', label: 'jours' }
      ]

  const currentAgeType = ageTypeList.find(({ id }) => id === _ageType)

  return (
    <>
      <Typography variant="h3">Âge :</Typography>

      <Grid className={classes.gridSection}>
        <Grid>
          <Slider
            value={_age}
            onChange={_onChangeAge}
            aria-labelledby="range-slider"
            valueLabelDisplay="off"
            valueLabelFormat={(value) => (value === limits[1] ? `${limits[1]}+` : value)}
            min={limits[0]}
            max={limits[1]}
          />

          <Grid container justifyContent="space-around">
            <Grid item style={{ flex: 0.5, margin: '0 4px' }}>
              <TextField
                value={_age[0]}
                type="number"
                onChange={(e) =>
                  _onChangeAge({} as React.ChangeEvent<{}>, [
                    +e.target.value >= limits[0] && +e.target.value <= limits[1] ? +e.target.value : _age[0],
                    _age[1]
                  ])
                }
              />
            </Grid>
            <Grid item style={{ flex: 0.5, margin: '0 4px' }}>
              <TextField
                value={_age[1]}
                InputProps={{ inputProps: { min: 1 } }}
                type="number"
                onChange={(e) =>
                  _onChangeAge({} as React.ChangeEvent<{}>, [
                    _age[0],
                    +e.target.value >= limits[0] && +e.target.value <= limits[1] ? +e.target.value : _age[1]
                  ])
                }
                error={error}
              />
            </Grid>
          </Grid>
        </Grid>

        <Autocomplete
          id="criteria-ageType-autocomplete"
          className={classes.inputItem}
          options={ageTypeList}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) => option.id === value.id}
          value={currentAgeType}
          onChange={(e, value) => _onChangeAgeType((value?.id ?? 'year') as 'year' | 'month' | 'days')}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
      </Grid>

      {error && <Typography style={{ color: '#f44336' }}>La valeur maximale ne peut pas être égale à 0.</Typography>}
    </>
  )
}

export default InputAgeRangeSlider
