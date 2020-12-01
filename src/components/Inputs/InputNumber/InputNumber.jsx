import React, { useState, useEffect } from 'react'

import { FormControl, FormLabel, Grid, IconButton, InputBase, Typography } from '@material-ui/core'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import useStyles from './styles'

const InputNumber = (props) => {
  const { label, placeholder, value, onChange, error, errorMessage, minValue, maxValue, className } = props
  const step = props.step ? props.step : 1

  const classes = useStyles()
  const [_value, onChangeValue] = useState(value)

  useEffect(() => onChangeValue(value), [value])

  const _onClickButton = (count) => {
    let savedValue = parseInt(_value)
    savedValue += count

    if (minValue !== undefined && +savedValue < minValue) savedValue = null
    if (maxValue !== undefined && +savedValue > maxValue) savedValue = maxValue

    onChangeValue(savedValue)
    if (onChange && typeof onChange === 'function') {
      onChange(savedValue)
    }
  }

  const _onChangeValue = (newValue) => {
    if (minValue !== undefined && +newValue < minValue) newValue = null
    if (maxValue !== undefined && +newValue > maxValue) newValue = maxValue

    onChangeValue(newValue)
    if (onChange && typeof onChange === 'function') {
      onChange(newValue)
    }
  }

  return (
    <FormControl component="fieldset" className={`${classes.formControl} ${className ? className : ''}`}>
      {label && <FormLabel component="legend">{label}</FormLabel>}

      <InputBase
        classes={{
          root: classes.inputText,
          error: classes.inputTextError
        }}
        placeholder={placeholder ? placeholder : ''}
        type="number"
        error={error === true}
        value={`${_value}`}
        endAdornment={
          <Grid>
            <IconButton onClick={() => _onClickButton(step)} size="small">
              <KeyboardArrowUpIcon style={{ margin: -10 }} />
            </IconButton>
            <IconButton onClick={() => _onClickButton(-step)} size="small">
              <KeyboardArrowDownIcon style={{ margin: -10 }} />
            </IconButton>
          </Grid>
        }
        onChange={(e) => _onChangeValue(+e.target.value)}
      />

      {errorMessage && <Typography className={classes.errorMessage}> {errorMessage} </Typography>}
    </FormControl>
  )
}
export default InputNumber
