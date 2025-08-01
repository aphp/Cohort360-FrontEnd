import React, { useEffect } from 'react'
import { useAppSelector } from 'state'

import { Divider, Grid, Typography } from '@mui/material'

import SearchInput from 'components/ui/Searchbar/SearchInput'
import { useNavigate } from 'react-router-dom'
import DisplayLocked from 'components/ui/Display/DisplayLocked'

const SearchPatientCard = () => {
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
      <Divider sx={{ marginBottom: 1 }} />
      <Grid container sx={{ flexGrow: 1, alignItems: 'center' }}>
        {deidentifiedBoolean ? (
          <DisplayLocked />
        ) : (
          <Grid
            size={12}
            container
            sx={{ flexDirection: 'column', justifyContent: 'flex-end' }}
            height={30}
            marginTop="4px"
          >
            <SearchInput
              value={searchInput}
              searchOnClick
              placeholder="Cherchez un ipp, nom et/ou prénom"
              onChange={(newValue) => setSearchInput(newValue)}
            />
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default SearchPatientCard
