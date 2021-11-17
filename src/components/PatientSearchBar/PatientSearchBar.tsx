import React, { useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Grid, IconButton, InputAdornment, InputBase, MenuItem, Select } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import { SearchByTypes } from 'types'

import useStyles from './styles'

type PatientSearchBarProps = {
  performQueries?: (
    page: number,
    sortBy: string,
    sortDirection: string,
    searchInput: string,
    searchBy: SearchByTypes
  ) => void
  showSelect?: boolean
  searchInput?: string
  onChangeInput?: (input: string) => void
  searchBy?: SearchByTypes
  onChangeSearchBy?: (searchBy: SearchByTypes) => void
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  performQueries,
  showSelect,
  searchInput,
  onChangeInput,
  searchBy = SearchByTypes.text,
  onChangeSearchBy
}) => {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const { search } = useParams<{ search: string }>()

  const [_searchInput, setSearchInput] = useState(search ?? searchInput)

  const page = 1
  const sortBy = 'given'
  const sortDirection = 'asc'

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    if (onChangeSearchBy) {
      onChangeSearchBy(event.target.value as SearchByTypes)
    }
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
    if (onChangeInput) {
      onChangeInput(event.target.value)
    }
  }

  const handleClearInput = () => {
    setSearchInput('')
  }

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (!_searchInput) return
      if (location.pathname === '/accueil') {
        history.push(`/rechercher_patient/${_searchInput}`)
      } else {
        performQueries && performQueries(page, sortBy, sortDirection, _searchInput, searchBy)
      }
    }
  }

  const onSearchPatient = async () => {
    if (!_searchInput) return
    if (location.pathname === '/accueil') {
      history.push(`/rechercher_patient/${_searchInput}`)
    } else {
      performQueries && performQueries(page, sortBy, sortDirection, _searchInput, searchBy)
    }
  }

  return (
    <Grid container alignItems="center" className={classes.component}>
      {showSelect && (
        <Grid container item xs={2} justify="center">
          <Select value={searchBy} onChange={handleChangeSelect}>
            <MenuItem value={SearchByTypes.text}>Tous les champs</MenuItem>
            <MenuItem value={SearchByTypes.family}>Nom</MenuItem>
            <MenuItem value={SearchByTypes.given}>Prénom</MenuItem>
            <MenuItem value={SearchByTypes.identifier}>IPP</MenuItem>
          </Select>
        </Grid>
      )}
      <Grid item container xs={showSelect ? 10 : 12} alignItems="center" className={classes.searchBar}>
        <InputBase
          placeholder="Cherchez un ipp, nom et/ou prénom"
          className={classes.input}
          value={_searchInput}
          onChange={handleChangeInput}
          onKeyDown={onKeyDown}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClearInput}>{_searchInput && <ClearIcon />}</IconButton>
            </InputAdornment>
          }
        />
        <IconButton type="submit" aria-label="search" onClick={onSearchPatient}>
          <SearchIcon fill="#ED6D91" height="15px" />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default PatientSearchBar
