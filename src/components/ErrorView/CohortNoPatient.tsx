import React from 'react'
import clsx from 'clsx'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { ReactComponent as PersonOffIcon } from 'assets/icones/person-off.svg'

import { useAppSelector } from 'state'

import useStyles from './styles'

const CohortNoPatient = () => {
  const classes = useStyles()
  const history = useHistory()

  const { openDrawer } = useAppSelector((state) => ({ openDrawer: state.drawer }))

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      spacing={2}
      className={clsx(classes.appBar, { [classes.appBarShift]: openDrawer })}
    >
      <Grid item className={classes.item}>
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item style={{ padding: 16 }}>
            <PersonOffIcon style={{ fontSize: 60 }} />
          </Grid>
          <Grid item style={{ padding: '8px 32px' }}>
            <Typography variant="h5" align="center">
              Votre cohorte de patients est vide
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item style={{ marginTop: 16 }}>
        <Button variant="outlined" style={{ borderColor: 'currentColor' }} onClick={() => history.push('/accueil')}>
          Retour à l'accueil
        </Button>
      </Grid>
    </Grid>
  )
}

export default CohortNoPatient
