import React from 'react'
import clsx from 'clsx'

import { Button, CircularProgress, Divider, Grid, Typography } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'

import useStyle from './styles'

import { CohortCreationCounterType } from 'types'

const ControlPanel: React.FC<
  {
    executeLoading?: boolean
    onExecute: () => void
    onUndo?: () => void
    onRedo?: () => void
  } & CohortCreationCounterType
> = ({ includePatient, byrequest, alive, deceased, female, male, executeLoading, onExecute, onUndo, onRedo }) => {
  const classes = useStyle()

  return (
    <Grid className={classes.rightPanelContainerStyle}>
      <Grid>
        <Grid container justify="center" className={classes.requestAction}>
          <Button disabled={executeLoading} onClick={onExecute} className={classes.requestExecution}>
            {executeLoading ? (
              <>
                Veuillez patienter
                <CircularProgress size={20} />
              </>
            ) : (
              'Exécuter la requête'
            )}
          </Button>
        </Grid>

        <Divider />

        <Button
          className={classes.actionButton}
          onClick={onUndo}
          disabled={typeof onUndo !== 'function'}
          startIcon={<ArrowBackIcon color="action" className={classes.iconBorder} />}
        >
          <Typography className={classes.boldText}>Annuler</Typography>
        </Button>

        <Divider />

        <Button
          className={classes.actionButton}
          onClick={onRedo}
          disabled={typeof onRedo !== 'function'}
          startIcon={<ArrowForwardIcon color="action" className={classes.iconBorder} />}
        >
          <Typography className={classes.boldText}>Rétablir</Typography>
        </Button>

        <Divider />

        <Button
          className={classes.actionButton}
          startIcon={<UpdateSharpIcon color="action" className={classes.iconBorder} />}
        >
          <Typography className={classes.boldText}>Réinitialiser</Typography>
        </Button>
      </Grid>
      <Divider />
      <Grid>
        <Grid container justify="space-between">
          <Typography className={clsx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS</Typography>
          <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
            {includePatient === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : includePatient ?? '-'}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Par requête</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
            {byrequest === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : byrequest ?? '-'}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Patients vivants</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
            {alive === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : alive ?? '-'}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Patients décédés</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
            {deceased === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : deceased ?? '-'}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={clsx(classes.sidesMargin)}>Nombre de femmes</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
            {female === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : female ?? '-'}
          </Typography>
        </Grid>
        <Grid container justify="space-between">
          <Typography className={classes.sidesMargin}>Nombre d'hommes</Typography>
          <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
            {male === 'loading' ? <Skeleton variant="rect" width={50} height={19} /> : male ?? '-'}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ControlPanel
