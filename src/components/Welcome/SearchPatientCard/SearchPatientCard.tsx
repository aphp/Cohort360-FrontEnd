import React, { Fragment } from 'react'
import { useAppSelector } from 'state'

import { Divider, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from 'components/PatientSearchBar/PatientSearchBar'
import Title from 'components/Title'

import LockIcon from '@material-ui/icons/Lock'

import useStyles from './styles'

const PatientSearchCard = () => {
  const classes = useStyles()
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <>
      <div id="search-patient-card-title">
        <Title>Chercher un patient</Title>
      </div>
      <Divider className={classes.divider} />
      {deidentifiedBoolean ? (
        <Grid container item justifyContent="center">
          <LockIcon className={classes.lockIcon} />
          <Typography variant="h6">Fonctionnalité désactivée en mode pseudonymisé.</Typography>
        </Grid>
      ) : (
        <Grid container direction="column" justifyContent="space-evenly" style={{ height: '100%', marginTop: 8 }}>
          <PatientSearchBar />
        </Grid>
      )}
    </>
  )
}

export default PatientSearchCard
