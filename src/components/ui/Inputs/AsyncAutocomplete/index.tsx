import React, { useEffect, useState, Fragment, useRef } from 'react'

import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { cancelPendingRequest } from 'utils/abortController'
import { LabelObject } from 'types/searchCriterias'

type AsyncAutocompleteProps = {
  variant?: 'standard' | 'filled' | 'outlined'
  label?: string
  className?: string
  values?: LabelObject[]
  noOptionsText?: string
  helperText?: string
  disabled?: boolean
  onFetch: (options: any, signal: AbortSignal) => Promise<any>
  onChange: (elem: LabelObject[]) => void
}

const AsyncAutocomplete = ({
  variant,
  label,
  className,
  values = [],
  noOptionsText,
  helperText,
  disabled = false,
  onChange,
  onFetch
}: AsyncAutocompleteProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [options, setOptions] = useState<LabelObject[]>([])
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
  }, [onFetch, searchValue])

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

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
      value={values}
      autoComplete
      filterSelectedOptions
      onChange={(event: any, newValue: any) => {
        onChange(newValue)
      }}
      options={options}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
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

export default AsyncAutocomplete
