import React from 'react'
import { Select, MenuItem, SelectProps, FormControl, InputLabel, FormHelperText } from '@material-ui/core'
import { UnpackNestedValue, DeepPartial } from 'react-hook-form'

type SelectInputProps<K extends Record<string, any>, T = UnpackNestedValue<DeepPartial<K>>> = SelectProps & {
  title?: string
  inputRef?: (ref: any) => void
  name?: keyof T
  error?: boolean
  helperText?: string
  options: { id: string; label: string }[]
  containerStyle?: React.CSSProperties
}

const SelectInput = <K extends Record<string, any>>({
  title,
  options,
  name,
  containerStyle,
  error,
  helperText,
  ...selectProps
}: SelectInputProps<K>) => {
  return (
    <FormControl style={{ width: '100%', ...containerStyle }}>
      <InputLabel error={error}>{title}</InputLabel>
      <Select name={name} error={error} fullWidth {...selectProps}>
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </FormControl>
  )
}

export default SelectInput
