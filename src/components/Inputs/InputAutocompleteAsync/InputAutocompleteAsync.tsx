import React, { useState } from 'react'

import { TextField, CircularProgress } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'

interface ElementType {
  id: string
  label: string
}

type InputAutocompleteAsyncProps = {
  id?: string
  className?: string
  options?: any[]
  getOptionLabel?: (value: any) => string
  defaultValue?: any
  onChange?: (e: any, value: any) => void
  renderInput?: any
  variant?: 'standard' | 'filled' | 'outlined'
  multiple?: boolean
  autocompleteOptions?: ElementType[]
  getAutocompleteOptions?: () => any
  noOptionsText?: string
}

const InputAutocompleteAsync: React.FC<InputAutocompleteAsyncProps> = (props) => {
  const { variant, multiple, autocompleteOptions, getAutocompleteOptions, noOptionsText } = props

  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ElementType[]>([])
  const loading = open && options.length === 0

  React.useEffect(() => {
    let active = true

    if (!loading) {
      return undefined
    }

    // (async () => {
    //   const response = await fetch('https://country.register.gov.uk/records.json?page-size=5000');
    //   await sleep(1e3); // For demo purposes.
    //   const countries = await response.json();

    //   if (active) {
    //     setOptions(Object.keys(countries).map((key) => countries[key].item[0]) as ElementType[]);
    //   }
    // })();

    return () => {
      active = false
    }
  }, [loading])

  React.useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      getOptionSelected={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Asynchronous"
          variant={variant}
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
