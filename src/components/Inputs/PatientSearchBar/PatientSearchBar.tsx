import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Grid, IconButton, InputAdornment, InputBase } from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import useStyles from './styles'

type PatientSearchBarProps = {
  searchInput?: string
  onChangeInput?: (input: string) => void
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({ searchInput, onChangeInput }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const { search } = useParams<{ search: string }>()

  const [_searchInput, setSearchInput] = useState(search ?? searchInput)

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
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!_searchInput) return
      navigate(`/patient-search/${_searchInput}`)
    }
  }

  const onSearchPatient = async () => {
    if (!_searchInput) return
    navigate(`/patient-search/${_searchInput}`)
  }

  return (
    <Grid container alignItems="center" className={classes.component}>
      <Grid item container alignItems="center" className={classes.searchBar}>
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
