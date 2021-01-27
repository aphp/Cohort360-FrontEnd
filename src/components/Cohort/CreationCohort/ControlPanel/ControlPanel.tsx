import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Button, CircularProgress, Divider, Grid, Typography } from '@material-ui/core'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'

import ModalCohortTitle from './components/ModalCohortTitle/ModalCohortTitle'

import { useAppSelector } from 'state'
import { resetCohortCreation } from 'state/cohortCreation'

import useStyle from './styles'

const ControlPanel: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string) => void
  onUndo?: () => void
  onRedo?: () => void
}> = ({ onExecute, onUndo, onRedo }) => {
  const classes = useStyle()
  const dispatch = useDispatch()
  const [openModal, onSetOpenModal] = useState<'executeCohortConfirmation' | null>(null)

  const {
    loading = false,
    count: { includePatient /*, byrequest, alive, deceased, female, male*/ }
  } = useAppSelector((state) => state.cohortCreation.request || {})

  return (
    <>
      <Grid className={classes.rightPanelContainerStyle}>
        <Grid>
          <Grid container justify="center" className={classes.requestAction}>
            <Button
              disabled={typeof onExecute !== 'function'}
              onClick={() => onSetOpenModal('executeCohortConfirmation')}
              className={classes.requestExecution}
            >
              {loading ? (
                <>
                  Veuillez patienter
                  <CircularProgress style={{ marginLeft: '15px' }} size={30} />
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
            onClick={() => dispatch(resetCohortCreation())}
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
              {loading ? <CircularProgress size={30} /> : includePatient ?? '-'}
            </Typography>
          </Grid>
          {/* <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Par requête</Typography>
            <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
              {loading ? <Skeleton variant="rect" width={50} height={19} /> : byrequest ?? '-'}
            </Typography>
          </Grid> */}
          {/* <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Patients vivants</Typography>
            <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
              {loading ? <Skeleton variant="rect" width={50} height={19} /> : alive ?? '-'}
            </Typography>
          </Grid> */}
          {/* <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Patients décédés</Typography>
            <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
              {loading ? <Skeleton variant="rect" width={50} height={19} /> : deceased ?? '-'}
            </Typography>
          </Grid> */}
          {/* <Grid container justify="space-between">
            <Typography className={clsx(classes.sidesMargin)}>Nombre de femmes</Typography>
            <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
              {loading ? <Skeleton variant="rect" width={50} height={19} /> : female ?? '-'}
            </Typography> */}
          {/* </Grid>
          <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Nombre d'hommes</Typography>
            <Typography className={clsx(classes.blueText, classes.sidesMargin)}>
              {loading ? <Skeleton variant="rect" width={50} height={19} /> : male ?? '-'}
            </Typography>
          </Grid> */}
        </Grid>
      </Grid>

      {openModal === 'executeCohortConfirmation' && (
        <ModalCohortTitle onExecute={onExecute} onClose={() => onSetOpenModal(null)} />
      )}
    </>
  )
}

export default ControlPanel
