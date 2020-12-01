import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { FormControl, FormLabel, Grid, TextField, Typography } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'

import InputNumber from '../InputNumber/InputNumber'

import useStyles from './styles'

const InputDate = (props) => {
  const { label, value, onChange, errorMessage } = props

  const monthList = [
    { key: 'Janvier', value: 1 },
    { key: 'Février', value: 2 },
    { key: 'Mars', value: 3 },
    { key: 'Avril', value: 4 },
    { key: 'Mai', value: 5 },
    { key: 'Juin', value: 6 },
    { key: 'Juillet', value: 7 },
    { key: 'Août', value: 8 },
    { key: 'Septembre', value: 9 },
    { key: 'Octobre', value: 10 },
    { key: 'Novembre', value: 11 },
    { key: 'Décembre', value: 12 }
  ]

  const classes = useStyles()
  const [day, onChangeDay] = useState(null)
  const [month, onChangeMonth] = useState(null)
  const [year, onChangeYear] = useState(null)

  useEffect(() => {
    const momentValue = moment(value, 'YYYY-MM-DD')
    if (momentValue && momentValue.isValid() === false) return

    onChangeDay(momentValue.format('D'))
    onChangeMonth(momentValue.format('M'))
    onChangeYear(momentValue.format('YYYY'))
  }, [value])

  const _onChangeValue = (key, value) => {
    if (!value) {
      return
    }
    let _day = day
    let _month = month
    let _year = year

    switch (key) {
      case 'day':
        _day = value
        onChangeDay(value)
        break
      case 'month':
        _month = value
        onChangeMonth(value)
        break
      case 'year':
        _year = value
        onChangeYear(value)
        break
      default:
        break
    }

    if (_day && _month && _year) {
      const date = `${_year}-${_month}-${_day}`
      const dateMoment = moment(date, 'YYYY-M-D')
      if (dateMoment && dateMoment.isValid() === false) return

      if (onChange && typeof onChange === 'function') {
        onChange(dateMoment.format('YYYY-MM-DD'))
      }
    }
  }

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      {label && <FormLabel component="legend">{label}</FormLabel>}

      <Grid className={classes.inputContainer}>
        <InputNumber
          className={classes.dayInput}
          placeholder={'Jour'}
          value={day}
          minValue={1}
          maxValue={31}
          onChange={(_day) => _onChangeValue('day', _day)}
        />

        <Autocomplete
          classes={{ root: classes.monthInput, inputRoot: classes.monthInputRoot }}
          options={monthList}
          getOptionLabel={({ key }) => key}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder="Mois" classes={{ error: classes.inputTextError }} />
          )}
          onChange={(e, v) => _onChangeValue('month', v?.value)}
        />

        <InputNumber
          className={classes.yearInput}
          placeholder={'Année'}
          value={year}
          onChange={(_year) => (_year && `${_year}`.length === 4 ? _onChangeValue('year', _year) : null)}
        />
      </Grid>

      {errorMessage && <Typography className={classes.errorMessage}> {errorMessage} </Typography>}
    </FormControl>
  )
}
export default InputDate
