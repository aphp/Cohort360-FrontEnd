import React, { useState } from 'react'

import { TextField, CircularProgress } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'

interface ElementType {
  id: string
  label: string
}

type InputAutocompleteAsyncProps = {
  id?: string
  variant?: 'standard' | 'filled' | 'outlined'
  label?: string
  className?: string
  multiple?: boolean
  autocompleteValue?: any
  onChange?: (e: any, value: any) => void
  renderInput?: any
  autocompleteOptions?: ElementType[]
  getAutocompleteOptions?: (searchValue: string) => Promise<any>
  noOptionsText?: string
  helperText?: string
}

const InputAutocompleteAsync: React.FC<InputAutocompleteAsyncProps> = (props) => {
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

  React.useEffect(() => {
    let active = true

    ;(async () => {
      setLoading(true)
      if (!getAutocompleteOptions) return
      const response = (await getAutocompleteOptions(searchValue)) || []

      if (active) {
        setOptions(response)
        setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [searchValue])

  React.useEffect(() => {
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
      getOptionSelected={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant={variant}
          value={searchValue}
          helperText={helperText}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  )
}

export default InputAutocompleteAsync
