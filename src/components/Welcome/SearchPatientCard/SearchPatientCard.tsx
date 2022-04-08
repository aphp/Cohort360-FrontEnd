import React, { Fragment } from 'react'
import { useAppSelector } from 'state'

import { Divider, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from 'components/Inputs/PatientSearchBar/PatientSearchBar'

import LockIcon from '@material-ui/icons/Lock'

import useStyles from './styles'

const SearchPatientCard = () => {
  const classes = useStyles()
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <>
      <div id="search-patient-card-title">
        <Typography component="h2" variant="h2" color="primary" gutterBottom>
          Chercher un patient
        </Typography>
      </div>
      <Divider className={classes.divider} />
      {deidentifiedBoolean ? (
        <Grid container item justifyContent="center">
          <LockIcon className={classes.lockIcon} />
          <Typography variant="h6" align="center">
            Fonctionnalité désactivée en mode pseudonymisé.
          </Typography>
        </Grid>
      ) : (
        <Grid container direction="column" justifyContent="space-evenly" style={{ height: '100%', marginTop: 8 }}>
          <PatientSearchBar />
        </Grid>
      )}
    </>
  )
}

export default SearchPatientCard
