import React, { useEffect, useState, Fragment, useRef, SyntheticEvent } from 'react'

import { Autocomplete, CircularProgress, TextField } from '@mui/material'

import { displaySystem } from 'utils/displayValueSetSystem'

import { cancelPendingRequest } from 'utils/abortController'

interface ElementType {
  id: string
  label: string
  system?: string
}

type InputAutocompleteAsyncProps = {
  id?: string
  variant?: 'standard' | 'filled' | 'outlined'
  label?: string
  className?: string
  multiple?: boolean
  autocompleteValue?: ElementType | ElementType[] | null
  onChange?: (e: SyntheticEvent, value: ElementType | ElementType[] | null) => void
  renderInput?: ElementType
  autocompleteOptions?: ElementType[]
  getAutocompleteOptions?: (searchValue: string, signal: AbortSignal) => Promise<ElementType[]>
  noOptionsText?: string
  helperText?: string
}

const InputAutocompleteAsync = (props: InputAutocompleteAsyncProps) => {
  const {
    id,
    variant,
    label,
    className,
    multiple = false,
    autocompleteValue = multiple ? null : [],
    autocompleteOptions = [],
    onChange,
    getAutocompleteOptions,
    noOptionsText,
    helperText
  } = props

  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [options, setOptions] = useState<ElementType[]>(autocompleteOptions)
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let active = true

    ;(async () => {
      setLoading(true)
      if (!getAutocompleteOptions) return
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      const response = (await getAutocompleteOptions(searchValue, controllerRef.current?.signal)) || []

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

  return (
    <Autocomplete
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      id={id}
      open={open}
      className={className}
      multiple={multiple}
      noOptionsText={noOptionsText}
      loading={loading}
      value={autocompleteValue}
      onChange={onChange}
      options={options ?? []}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${displaySystem(option?.system)}${option.label} `}
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
