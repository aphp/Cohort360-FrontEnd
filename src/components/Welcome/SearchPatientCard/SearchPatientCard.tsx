import React from 'react'
import { useAppSelector } from 'state'

import { Divider, Grid, Typography } from '@material-ui/core'

import PatientSearchBar from '../../PatientSearchBar/PatientSearchBar'
import Title from '../../Title'

import LockIcon from '@material-ui/icons/Lock'

import useStyles from './styles'

const PatientSearchCard = () => {
  const classes = useStyles()
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <>
      <Title>Explorer les données d'un patient pris en charge</Title>
      <Divider className={classes.divider} />
      {deidentifiedBoolean ? (
        <Grid container item justify="center">
          <LockIcon className={classes.lockIcon} />
          <Typography variant="h6">Fonctionnalité désactivée en mode pseudonymisé.</Typography>
        </Grid>
      ) : (
        <PatientSearchBar />
      )}
    </>
  )
}

export default PatientSearchCard
