import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import PageContainer from 'components/ui/PageContainer'

import PersonOffIcon from 'assets/icones/person-off.svg?react'

import useStyles from './styles'

const PatientNotExist = () => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  return (
    <PageContainer justifyContent="center" alignItems="center" spacing={2} height={'100vh'}>
      <Grid item className={classes.item}>
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Grid item style={{ padding: 16 }}>
            <PersonOffIcon style={{ fontSize: 60 }} />
          </Grid>
          <Grid item style={{ padding: '8px 32px' }}>
            <Typography style={{ marginBottom: 16 }} variant="h5" align="center">
              Vous tentez d'accéder aux informations d'un patient qui ne sont pas disponibles
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item>
        <Button variant="outlined" style={{ borderColor: 'currentColor' }} onClick={() => navigate('/home')}>
          Retour à l'accueil
        </Button>
      </Grid>
    </PageContainer>
  )
}

export default PatientNotExist
