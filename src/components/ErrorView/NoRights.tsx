import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import WarningIcon from '@mui/icons-material/Report'

import useStyles from './styles'
import { AppConfig } from 'config'

type NoRightsProps = {
  oidcCode: string | null
}

const NoRights: React.FC<NoRightsProps> = ({ oidcCode }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const appConfig = useContext(AppConfig)

  return (
    <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2} height="100vh">
      <Grid item className={classes.item}>
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Grid item style={{ padding: 16 }}>
            <WarningIcon style={{ fontSize: 60 }} />
          </Grid>
          <Grid item container justifyContent="center" style={{ padding: '8px 32px' }}>
            <Typography style={{ marginBottom: 16 }} variant="h5" align="center">
              Vous n'avez pas accès à l'application Cohort360. Merci de vous rapprocher de votre coordinateur pour
              demander la création de votre compte Cohort360 ainsi qu'un créneau de formation obligatoire pour utiliser
              l'application.
            </Typography>
            <Typography align="center">
              S'il s'agit d'une erreur, vous pouvez contacter le support Cohort360 à l'adresse suivante:{' '}
              {appConfig.system.mailSupport}.
            </Typography>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <Link
                target="_blank"
                rel="noopener"
                href="https://eds.aphp.fr/sites/default/files/2021-09/EDS_AP-HP_ListeCoordGHDS_20210901.pdf"
              >
                Liste des coordinateurs
              </Link>
            </div>
          </Grid>
        </Grid>
      </Grid>

      <Grid item>
        <Button
          variant="outlined"
          style={{ borderColor: 'currentColor' }}
          onClick={() => (oidcCode ? navigate(-1) : navigate(0))}
        >
          Retour à la connexion
        </Button>
      </Grid>
    </Grid>
  )
}

export default NoRights
