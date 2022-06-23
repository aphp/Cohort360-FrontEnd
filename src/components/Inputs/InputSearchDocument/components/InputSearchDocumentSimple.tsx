import React, { useEffect, useState } from 'react'

import { Grid, IconButton, InputAdornment, InputBase } from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import ClearIcon from '@mui/icons-material/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import DocumentSearchHelp from 'components/Inputs/InputSearchDocument/components/DocumentSearchHelp/DocumentSearchHelp'

import useStyles from './styles'

type InputSearchDocumentSimpleProps = {
  placeholder?: string
  defaultSearchInput?: string
  setDefaultSearchInput?: (newSearchInput: string) => void
  onSearchDocument: (newInputText: string) => void
  noInfoIcon?: boolean
  noClearIcon?: boolean
  noSearchIcon?: boolean
  sqareInput?: boolean
}
const InputSearchDocumentSimple: React.FC<InputSearchDocumentSimpleProps> = ({
  placeholder,
  defaultSearchInput,
  setDefaultSearchInput,
  onSearchDocument,
  ...props
}) => {
  const classes = useStyles()

  const [searchInput, setSearchInput] = useState<string>(defaultSearchInput ?? '')
  const [helpOpen, setHelpOpen] = useState(false)

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSearchDocument(searchInput)
    }
  }

  useEffect(() => {
    setSearchInput(defaultSearchInput ?? '')
  }, [defaultSearchInput])

  return (
    <>
      <Grid container item className={props.sqareInput ? classes.gridAdvancedSearchSqared : classes.gridAdvancedSearch}>
        <InputBase
          fullWidth
          placeholder={placeholder ?? 'Recherche dans les documents'}
          value={searchInput}
          onChange={handleChangeInput}
          multiline
          onKeyDown={onKeyDown}
          endAdornment={
            <InputAdornment position="end">
              {!props.noInfoIcon && (
                <IconButton size="small" onClick={() => setHelpOpen(true)}>
                  <InfoIcon />
                </IconButton>
              )}

              {!props.noClearIcon && searchInput && (
                <IconButton size="small" onClick={handleClearInput}>
                  <ClearIcon />
                </IconButton>
              )}

              {!props.noSearchIcon && (
                <IconButton
                  size="small"
                  type="submit"
                  aria-label="search"
                  onClick={() => onSearchDocument(searchInput)}
                >
                  <SearchIcon fill="#ED6D91" height="17px" />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
      </Grid>

      <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}

export default InputSearchDocumentSimple
