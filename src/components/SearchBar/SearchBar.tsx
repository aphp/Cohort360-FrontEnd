import React from 'react'

import { Grid, IconButton, InputAdornment, InputBase } from '@material-ui/core'

import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import ClearIcon from '@material-ui/icons/Clear'

import useStyles from './styles'

type SearchBarProps = {
  searchInput: string
  onChangeInput: (searchInput: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ searchInput, onChangeInput }) => {
  const classes = useStyles()

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChangeInput(event.target.value)
  }

  const handleClearInput = () => {
    onChangeInput('')
  }

  return (
    <Grid item container alignItems="center" className={classes.searchBar}>
      <InputBase
        placeholder="Rechercher"
        className={classes.input}
        value={searchInput}
        onChange={handleChangeInput}
        endAdornment={
          searchInput && (
            <InputAdornment position="end">
              <IconButton onClick={handleClearInput}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      />
      <IconButton type="submit" aria-label="search">
        <SearchIcon fill="#ED6D91" height="15px" />
      </IconButton>
    </Grid>
  )
}

export default SearchBar
