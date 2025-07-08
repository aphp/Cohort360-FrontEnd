import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import PageContainer from 'components/ui/PageContainer'

import WarningIcon from '@mui/icons-material/Report'

import { AppConfig } from 'config'

const CohortRightOrNotExist = () => {
  const navigate = useNavigate()
  const appConfig = useContext(AppConfig)

  return (
    <PageContainer justifyContent="center" alignItems="center" spacing={2} height="100vh">
      <Grid container item>
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Grid item style={{ padding: 16 }}>
            <WarningIcon style={{ fontSize: 60 }} />
          </Grid>
          <Grid item style={{ padding: '8px 32px' }}>
            <Typography style={{ marginBottom: 16 }} variant="h5" align="center">
              Vous tentez d'accéder à des données qui n'existent pas, ou vous ne disposez pas de droits suffisants
            </Typography>
            <Typography style={{ marginBottom: 16 }} align="center">
              S'il s'agit d'une erreur, vous pouvez contacter le support Cohort360 à l'adresse suivante :{' '}
              {appConfig.system.mailSupport}.
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

export default CohortRightOrNotExist
