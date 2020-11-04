import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import useStyles from './style'
import { useHistory, useLocation } from 'react-router-dom'

import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'

const PatientSearchBar = ({ performQueries, showSelect }) => {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()

  const [searchBy, setSearchBy] = useState('_text')
  const [searchInput, setSearchInput] = useState('')

  const handleChangeSelect = (event) => {
    setSearchBy(event.target.value)
  }

  const handleChangeInput = (event) => {
    setSearchInput(event.target.value)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      if (location.pathname === '/accueil') {
        history.push(`/rechercher_patient?${searchInput}`)
      } else {
        performQueries(searchInput, searchBy)
      }
    }
  }

  const onSearchPatient = async () => {
    if (location.pathname === '/accueil') {
      history.push(`/rechercher_patient?${searchInput}`)
    } else {
      performQueries(searchInput, searchBy)
    }
  }

  return (
    <Grid container alignItems="center" className={classes.component}>
      {showSelect && (
        <Grid container item xs={2} justify="center">
          <Select value={searchBy} onChange={handleChangeSelect}>
            <MenuItem value="_text">Tous les champs</MenuItem>
            <MenuItem value="family">Nom</MenuItem>
            <MenuItem value="given">Prénom</MenuItem>
            <MenuItem value="identifier">IPP</MenuItem>
          </Select>
        </Grid>
      )}
      <Grid
        item
        container
        xs={showSelect ? 10 : 12}
        alignItems="center"
        className={classes.searchBar}
      >
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
PatientSearchBar.propTypes = {
  performQueries: PropTypes.func,
  showSelect: PropTypes.bool
}

export default PatientSearchBar
