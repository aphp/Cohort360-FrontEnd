import React, { useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { Grid, IconButton, InputBase, MenuItem, Select } from '@material-ui/core'

import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'

import { SearchByTypes } from 'types'

import useStyles from './styles'

type PatientSearchBarProps = {
  performQueries?: (sortBy: string, sortDirection: string, searchInput: string, searchBy: SearchByTypes) => void
  showSelect?: boolean
  searchInput?: string
  onChangeInput?: (input: string) => void
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  performQueries,
  showSelect,
  searchInput,
  onChangeInput
}) => {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const { search } = useParams()

  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [_searchInput, setSearchInput] = useState(search ?? searchInput)

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined
      value: unknown
    }>
  ) => {
    setSearchBy(event.target.value as SearchByTypes)
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
    if (onChangeInput) {
      onChangeInput(event.target.value)
    }
  }

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (location.pathname === '/accueil') {
        history.push(`/rechercher_patient/${_searchInput}`)
      } else {
        performQueries && performQueries('given', 'asc', _searchInput, searchBy)
      }
    }
  }

  const onSearchPatient = async () => {
    if (location.pathname === '/accueil') {
      history.push(`/rechercher_patient/${_searchInput}`)
    } else {
      performQueries && performQueries('given', 'asc', _searchInput, searchBy)
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
          placeholder="Rechercher les données d'un patient: IPP, Nom ou Prénom"
          className={classes.input}
          value={_searchInput}
          onChange={handleChangeInput}
          onKeyDown={onKeyDown}
        />
        <IconButton type="submit" aria-label="search" onClick={onSearchPatient}>
          <SearchIcon fill="#ED6D91" height="15px" />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default PatientSearchBar
