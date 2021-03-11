import React from 'react'

import { Card, CardContent, Divider, Grid, Typography, CardActions } from '@material-ui/core'
import LockIcon from '@material-ui/icons/Lock'

import PatientSearchBar from 'components/PatientSearchBar/PatientSearchBar'
import Title from 'components/Title'
import { useAppSelector } from 'state'

const PatientSearchCard = () => {
  const deidentifiedBoolean = useAppSelector((state) => state.me?.deidentified ?? true)

  return (
    <Card>
      <CardContent>
        <Title>Chercher un patient dans votre périmètre</Title>
        <Divider />
      </CardContent>
      <CardActions>
        {deidentifiedBoolean ? (
          <Grid container justify="center">
            <LockIcon />
            <Typography variant="h6">Fonctionnalité désactivée en mode pseudonymisé.</Typography>
          </Grid>
        ) : (
          <PatientSearchBar />
        )}
      </CardActions>
    </Card>
  )
}

export default PatientSearchCard
