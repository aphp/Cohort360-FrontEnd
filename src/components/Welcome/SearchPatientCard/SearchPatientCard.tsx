import React, { useEffect } from 'react'
import { useAppSelector } from 'state'

import { Divider, Grid, Typography } from '@mui/material'

import useStyles from './styles'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { useNavigate } from 'react-router-dom'
import DisplayLocked from 'components/ui/Display/DisplayLocked/DisplayLocked'

const SearchPatientCard = () => {
  const { classes } = useStyles()
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)
  const [searchInput, setSearchInput] = React.useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (searchInput) navigate(`/patient-search/${searchInput}`)
  }, [searchInput])

  return (
    <>
      <div id="search-patient-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Chercher un patient
        </Typography>
      </div>
      <Divider className={classes.divider} />
      {deidentifiedBoolean ? (
        <DisplayLocked />
      ) : (
        <Grid container direction="column" justifyContent="space-evenly" style={{ height: '100%', marginTop: 8 }}>
          <Searchbar>
            <SearchInput
              value={searchInput}
              searchOnClick
              placeholder="Cherchez un ipp, nom et/ou prénom"
              onchange={(newValue) => setSearchInput(newValue)}
            />
          </Searchbar>
        </Grid>
      )}
    </>
  )
}

export default SearchPatientCard
