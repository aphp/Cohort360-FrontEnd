import React, { useEffect, useState } from 'react'

import { Grid, IconButton, InputAdornment, InputBase } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import useStyles from './styles'

type InputSearchDocumentRegexProps = {
  placeholder?: string
  defaultSearchInput?: string
  setDefaultSearchInput?: (newSearchInput: string) => void
  onSearchDocument: (newInputText: string) => void
  noInfoIcon?: boolean
  noClearIcon?: boolean
  noSearchIcon?: boolean
}
const InputSearchDocumentRegex: React.FC<InputSearchDocumentRegexProps> = ({
  placeholder,
  defaultSearchInput,
  setDefaultSearchInput,
  onSearchDocument,
  ...props
}) => {
  const classes = useStyles()

  const [searchInput, setSearchInput] = useState<string>(defaultSearchInput ?? '')

  const handleChangeInput = (event: any) => {
    setSearchInput(event.target.value)
    if (setDefaultSearchInput && typeof setDefaultSearchInput === 'function') {
      setDefaultSearchInput(event.target.value)
    }
  }

  const handleClearInput = () => {
    setSearchInput('')
    onSearchDocument('')
    if (setDefaultSearchInput && typeof setDefaultSearchInput === 'function') {
      setDefaultSearchInput('')
    }
  }

  const onKeyDown = async (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchDocument(searchInput)
    }
  }

  useEffect(() => {
    setSearchInput(defaultSearchInput ?? '')
  }, [defaultSearchInput])

  return (
    <Grid container item className={classes.gridAdvancedSearch}>
      <InputBase
        fullWidth
        placeholder={placeholder ?? 'Recherche avec regex dans les documents (Ne pas renseigner les séparateurs)'}
        value={searchInput}
        onChange={handleChangeInput}
        onKeyDown={onKeyDown}
        startAdornment={
          <InputAdornment position="start">
            <Grid className={classes.slash}>/</Grid>
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Grid className={classes.slash}>/</Grid>

            {!props.noClearIcon && searchInput && (
              <IconButton size="small" onClick={handleClearInput}>
                <ClearIcon />
              </IconButton>
            )}

            {!props.noSearchIcon && (
              <IconButton size="small" type="submit" aria-label="search" onClick={() => onSearchDocument(searchInput)}>
                <SearchIcon fill="#ED6D91" height="17px" />
              </IconButton>
            )}
          </InputAdornment>
        }
      />
    </Grid>
  )
}

export default InputSearchDocumentRegex
