import React from 'react'
import { TextField, InputProps, FormControl, FormHelperText } from '@material-ui/core'
import { UnpackNestedValue, DeepPartial } from 'react-hook-form'

type TextInputProps<K extends Record<string, any>, T = UnpackNestedValue<DeepPartial<K>>> = {
  title?: string
  inputRef?: (ref: any) => void
  name?: keyof T
  error?: boolean
  helperText?: string
  type?: 'text' | 'number'
  variant?: 'outlined' | 'filled' | 'standard' | undefined
  containerStyle?: React.CSSProperties
} & InputProps

const TextInput = <K extends Record<string, any>>({
  title,
  helperText,
  error,
  containerStyle,
  variant,
  inputRef,
  name,
  type,
  placeholder
}: TextInputProps<K>) => {
  return (
    <FormControl style={{ width: '100%', ...containerStyle }} component="div">
      <TextField
        id={name}
        label={title}
        error={error}
        variant={variant}
        placeholder={placeholder}
        inputRef={inputRef}
        name={name}
        type={type}
      />
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </FormControl>
  )
}

export default TextInput
