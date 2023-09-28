import React, { FC, useEffect, useState, Fragment } from 'react'

import { Autocomplete, CircularProgress, TextField } from '@mui/material'

import { MEDICATION_ATC, MEDICATION_UCD } from '../../../constants'

import { MedicationSystem } from 'types'

interface ElementType {
  id: string
  label: string
  system: MedicationSystem
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

const InputAutocompleteAsync: FC<InputAutocompleteAsyncProps> = (props) => {
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

  console.log('loading', loading)

  useEffect(() => {
    let active = true

    ;(async () => {
      console.log('je passe dans le useEffect de inputAutocompleteAsync')
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

  useEffect(() => {
    if (!open) {
      setOptions([])
    }
  }, [open])

  const displaySystem = (system: MedicationSystem) => {
    switch (system) {
      case MEDICATION_ATC:
        return 'ATC'
      case MEDICATION_UCD:
        return 'UCD'
      default:
        return ''
    }
  }

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
      getOptionLabel={(option) => `${displaySystem(option.system)} : ${option.label} `}
      renderInput={(params) => (
        <>
          {console.log('options', options)}
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
        </>
      )}
    />
  )
}

export default InputAutocompleteAsync
