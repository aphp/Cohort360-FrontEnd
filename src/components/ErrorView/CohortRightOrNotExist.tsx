import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import WarningIcon from '@mui/icons-material/Report'

import { useAppSelector } from 'state'

import useStyles from './styles'
import { MAIL_SUPPORT } from '../../constants'

const CohortRightOrNotExist = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()

  const { openDrawer } = useAppSelector((state) => ({ openDrawer: state.drawer }))

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      className={cx(classes.appBar, { [classes.appBarShift]: openDrawer })}
    >
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
              S'il s'agit d'une erreur, vous pouvez contacter le support Cohort360 à l'adresse suivante : {MAIL_SUPPORT}
              .
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item>
        <Button variant="outlined" style={{ borderColor: 'currentColor' }} onClick={() => navigate('/home')}>
          Retour à l'accueil
        </Button>
      </Grid>
    </Grid>
  )
}

export default CohortRightOrNotExist
