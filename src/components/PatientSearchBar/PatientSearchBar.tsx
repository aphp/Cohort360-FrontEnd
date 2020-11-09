import React, { useState } from 'react'

import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import useStyles from './styles'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'
import { SearchByTypes } from 'types'

type PatientSearchBarProps = {
  performQueries?: (searchInput: string, searchBy: SearchByTypes) => void
  showSelect?: boolean
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({ performQueries, showSelect }) => {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const { search } = useParams()

  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [searchInput, setSearchInput] = useState(search ?? '')

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
  }

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.keyCode === 13) {
      event.preventDefault()
      if (location.pathname === '/accueil') {
        history.push(`/rechercher_patient/${searchInput}`)
      } else {
        performQueries && performQueries(searchInput, searchBy)
      }
    }
  }

  const onSearchPatient = async () => {
    if (location.pathname === '/accueil') {
      history.push(`/rechercher_patient/${searchInput}`)
    } else {
      performQueries && performQueries(searchInput, searchBy)
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
          value={searchInput}
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
