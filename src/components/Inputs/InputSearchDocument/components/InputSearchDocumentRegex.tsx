import React, { useEffect, useState } from 'react'

import { Grid, IconButton, InputAdornment, InputBase, Typography, Tooltip } from '@material-ui/core'

import InfoIcon from '@material-ui/icons/Info'
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
  sqareInput?: boolean
}
const InputSearchDocumentRegex: React.FC<InputSearchDocumentRegexProps> = ({
  placeholder,
  defaultSearchInput,
  setDefaultSearchInput,
  onSearchDocument,
  ...props
}) => {
  const classes = useStyles()

  const [tooltip, setTooltip] = useState<boolean>(false)
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
    <Grid container item className={props.sqareInput ? classes.gridAdvancedSearchSqared : classes.gridAdvancedSearch}>
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
            {!props.noInfoIcon && (
              <Tooltip
                open={tooltip}
                title={
                  <>
                    <Typography>Une Expression régulière permet de faire des recherches complexes.</Typography>
                    <Typography>
                      Vous pouvez les tester ici : https://regex101.com/ avec la configuration FLAVOR = 'Java 8'
                    </Typography>
                    <Typography style={{ marginTop: 8 }}>Quelques exemples :</Typography>
                    <Typography style={{ marginLeft: 16 }}>[a-z] : Lettres minuscules de a à z</Typography>
                    <Typography style={{ marginLeft: 16 }}>[A-Z] : Lettres majuscules de A à Z</Typography>
                    <Typography style={{ marginLeft: 16 }}>[0-9] : Chiffres de 0 à 9</Typography>
                    <Typography style={{ marginLeft: 16 }}>
                      [a-z0-9] : Lettres minuscules de a à z ou chiffres de 0 à 9
                    </Typography>
                  </>
                }
              >
                <IconButton onClick={() => setTooltip(!tooltip)} size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            )}

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
            <Grid className={classes.slash}>/</Grid>
          </InputAdornment>
        }
      />
    </Grid>
  )
}

export default InputSearchDocumentRegex
