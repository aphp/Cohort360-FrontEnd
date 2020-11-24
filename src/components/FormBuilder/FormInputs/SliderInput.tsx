import React from 'react'
import { FormControl, FormLabel, Slider, FormHelperText, Grid, Typography, TextField } from '@material-ui/core'
import { UnpackNestedValue, DeepPartial } from 'react-hook-form'

type SliderInputProps<K extends Record<string, any>, T = UnpackNestedValue<DeepPartial<K>>> = {
  title?: string
  inputRef?: (ref: any) => void
  onChange: (value: any) => void
  name?: keyof T
  error?: boolean
  helperText?: string
  value: number | number[]
  containerStyle?: React.CSSProperties
  minValue?: number
  maxValue?: number
}

const SliderInput = <K extends Record<string, any>>({
  title,
  containerStyle,
  value,
  error,
  helperText,
  onChange,
  minValue,
  maxValue
}: SliderInputProps<K>) => {
  return (
    <>
      <FormControl component="fieldset" style={{ width: '99%', ...containerStyle }}>
        <FormLabel component="legend">{title}</FormLabel>
        <Slider
          value={value}
          onChange={(e, newValue) => onChange(newValue)}
          valueLabelDisplay="auto"
          min={minValue || undefined}
          max={maxValue || undefined}
          defaultValue={minValue !== undefined && maxValue !== undefined ? [minValue || 0, maxValue || 0] : undefined}
        />
      </FormControl>

      {value && Array.isArray(value) ? (
        <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <Typography>De</Typography>
          <TextField
            variant="outlined"
            value={value[0]}
            onChange={(e) =>
              onChange(
                minValue !== undefined && maxValue !== undefined
                  ? [
                      +e.target.value <= minValue ? minValue : +e.target.value >= maxValue ? maxValue : +e.target.value,
                      value[1]
                    ]
                  : [+e.target.value, value[1]]
              )
            }
          />

          <Typography>à</Typography>
          <TextField
            variant="outlined"
            value={value[1]}
            onChange={(e) =>
              onChange(
                minValue !== undefined && maxValue !== undefined
                  ? [
                      value[0],
                      +e.target.value <= minValue ? minValue : +e.target.value >= maxValue ? maxValue : +e.target.value
                    ]
                  : [value[0], +e.target.value]
              )
            }
          />
        </Grid>
      ) : (
        <></>
      )}
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </>
  )
}

export default SliderInput
