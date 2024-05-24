import React, { useEffect, useState, Fragment, useRef, SyntheticEvent } from 'react'

import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { cancelPendingRequest } from 'utils/abortController'
import { LabelObject } from 'types/searchCriterias'
import { useDebounce } from 'utils/debounce'
import { HierarchyElementWithSystem } from 'types'

type AsyncAutocompleteProps = {
  variant?: 'standard' | 'filled' | 'outlined'
  label?: string
  className?: string
  values?: LabelObject[]
  noOptionsText?: string
  helperText?: string
  disabled?: boolean
  onFetch: (options: string, signal: AbortSignal) => Promise<HierarchyElementWithSystem[]>
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
  const debouncedSearchValue = useDebounce(500, searchValue)
  const [options, setOptions] = useState<LabelObject[]>([])
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleRequest = async () => {
      if (!onFetch) return
      setLoading(true)
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      const response = (await onFetch(debouncedSearchValue, controllerRef.current?.signal)) || []
      setOptions(response)
      setLoading(false)
    }
    handleRequest()
  }, [debouncedSearchValue])

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
      loadingText={'Chargement en cours...'}
      loading={loading}
      value={values}
      autoComplete
      filterSelectedOptions
      onChange={(event: SyntheticEvent, newValue: LabelObject[]) => {
        onChange(newValue)
      }}
      options={options}
      filterOptions={(x) => x}
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
