import React from 'react'
import clsx from 'clsx'

import { Button, Divider, Grid, Typography } from '@material-ui/core'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'

import useStyle from './styles'

const ControlPanel = () => {
  const classes = useStyle()
  const includePatient = '21200'
  const byrequest = '21200'
  const alive = '17500'
  const deceased = '3700'
  const female = '14000'
  const male = '7200'

  return (
    <Grid className={classes.rightPanelContainerStyle}>
      <Grid>
        <Grid container justify="center" className={classes.requestAction}>
          <Button className={classes.requestExecution}>Exécuter la requête</Button>
        </Grid>

        <Divider />

        <Button>
          <ArrowBackIcon color="action" className={classes.iconBorder} />
          <Typography className={classes.boldText}>Annuler</Typography>
        </Button>

        <Divider />

        <Button>
          <ArrowForwardIcon color="action" className={classes.iconBorder} />
          <Typography className={classes.boldText}>Rétablir</Typography>
        </Button>

        <Divider />

        <Button>
          <UpdateSharpIcon color="action" className={classes.iconBorder} />
          <Typography className={classes.boldText}>Réinitialiser</Typography>
        </Button>
      </Grid>
      <Divider />
      <Grid>
        <Grid container justify="space-between">
          <Typography className={clsx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS</Typography>
          <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
            {includePatient}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Par requête</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{byrequest}</Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Patients vivants</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{alive}</Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Patients décédés</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{deceased}</Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={clsx(classes.sidesMargin)}>Nombre de femmes</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{female}</Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Nombre d'hommes</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{male}</Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ControlPanel
