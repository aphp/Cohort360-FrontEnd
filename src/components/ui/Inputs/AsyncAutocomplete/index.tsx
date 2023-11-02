import React, { FC, useEffect, useState, Fragment, useRef } from 'react'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { displaySystem } from 'utils/displayValueSetSystem'
import { cancelPendingRequest } from 'utils/abortController'

type InputAutocompleteAsyncProps<T> = {
  variant?: 'standard' | 'filled' | 'outlined'
  label?: string
  className?: string
  values?: T[]
  noOptionsText?: string
  helperText?: string
  disabled?: boolean
  onFetch: (options: any, signal: AbortSignal) => Promise<any>
  onChange: (elem: T[]) => void
}

const InputAutocompleteAsync = <T,>({
  variant,
  label,
  className,
  values = [],
  noOptionsText,
  helperText,
  disabled = false,
  onChange,
  onFetch
}: InputAutocompleteAsyncProps<T>) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [autocompleteValues, setAutocompleteValues] = React.useState<T[]>(values)
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let active = true

    ;(async () => {
      setLoading(true)
      if (!onFetch) return
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      const response = (await onFetch(searchValue, controllerRef.current?.signal)) || []
      if (active) {
        setOptions(response)
        setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [searchValue])

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  useEffect(() => {
    onChange(autocompleteValues)
  }, [autocompleteValues])

  return (
    <Autocomplete
      disabled={disabled}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      open={open}
      className={className}
      multiple
      noOptionsText={noOptionsText}
      loading={loading}
      value={autocompleteValues}
      autoComplete
      filterSelectedOptions
      onChange={(event: any, newValue: any) => {
        setAutocompleteValues(newValue)
      }}
      options={options}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${option.id} ${displaySystem(option.system)}${option.label} `}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant={variant}
          value={searchValue}
          helperText={helperText}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </Fragment>
            )
          }}
        />
      )}
    />
  )
}

export default InputAutocompleteAsync
