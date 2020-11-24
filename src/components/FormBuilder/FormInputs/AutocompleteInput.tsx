import React from 'react'
import { SelectProps, FormControl, FormHelperText, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { UnpackNestedValue, DeepPartial } from 'react-hook-form'

type AutocompleteInputProps<K extends Record<string, any>, T = UnpackNestedValue<DeepPartial<K>>> = SelectProps & {
  title?: string
  inputRef?: (ref: any) => void
  onChange: (value: any) => void
  name?: keyof T
  error?: boolean
  helperText?: string
  value: { id: string; label: string }
  options: { id: string; label: string }[]
  containerStyle?: React.CSSProperties
}

const AutocompleteInput = <K extends Record<string, any>>({
  title,
  options,
  containerStyle,
  value,
  error,
  helperText,
  variant,
  onChange
}: AutocompleteInputProps<K>) => {
  return (
    <FormControl style={{ width: '100%', ...containerStyle }}>
      <Autocomplete
        onChange={(e, value) => onChange(value)}
        defaultValue={value}
        options={options}
        getOptionLabel={(option: { id: string; label: string }) => option.label}
        renderInput={(params) => <TextField {...params} error={error} variant={variant} placeholder={title} />}
      />
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </FormControl>
  )
}

export default AutocompleteInput
