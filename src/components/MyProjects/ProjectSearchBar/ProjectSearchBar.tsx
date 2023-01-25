import React, { useState } from 'react'

import { Grid, InputBase, InputAdornment, IconButton } from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'

import useStyles from './styles'

type ProjectSearchBarProps = {
  setSearchInput: (newValue: string) => void
}

const ProjectSearchBar: React.FC<ProjectSearchBarProps> = ({ setSearchInput }) => {
  const classes = useStyles()

  const [search, setSearch] = useState('')

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchInput(search)
    }
  }

  return (
    <Grid item container xs={4} alignItems="center" className={classes.searchBar}>
      <InputBase
        placeholder="Rechercher"
        className={classes.input}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={onKeyDown}
        endAdornment={
          !!search && (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                }}
                size="large">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      />
      <IconButton
        onClick={() => setSearchInput(search)}
        aria-label="search"
        color="secondary"
        size="large">
        <SearchIcon fill="#ED6D91" height="15px" />
      </IconButton>
    </Grid>
  )
}

export default ProjectSearchBar
