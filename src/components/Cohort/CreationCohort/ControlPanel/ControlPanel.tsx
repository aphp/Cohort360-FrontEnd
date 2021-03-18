import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Button, CircularProgress, Divider, Grid, Typography } from '@material-ui/core'

// import ArrowBackIcon from '@material-ui/icons/ArrowBack'
// import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'

import ModalCohortTitle from './components/ModalCohortTitle/ModalCohortTitle'

import { useAppSelector } from 'state'
import { resetCohortCreation, countCohortCreation } from 'state/cohortCreation'

import useStyle from './styles'

const ControlPanel: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string) => void
  onUndo?: () => void
  onRedo?: () => void
}> = ({ onExecute }) => {
  const classes = useStyle()
  const dispatch = useDispatch()
  const [openModal, onSetOpenModal] = useState<'executeCohortConfirmation' | null>(null)

  const { loading = false, countLoading = false, count = {}, selectedPopulation = [] } = useAppSelector(
    (state) => state.cohortCreation.request || {}
  )
  const { includePatient /*byrequest, alive, deceased, female, male, unknownPatient */ } = count

  const accessIsPseudonymize =
    selectedPopulation === null
      ? false
      : selectedPopulation.map((population) => population.access).filter((elem) => elem && elem === 'Pseudonymisé')
          .length > 0

  useEffect(() => {
    const interval = setInterval(() => {
      if (count && count.status && (count.status === 'pending' || count.status === 'started')) {
        dispatch<any>(countCohortCreation({ uuid: count.uuid }))
      } else {
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [count]) //eslint-disable-line

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
                'Créer la cohorte'
              )}
            </Button>
          </Grid>

          <Divider />

          {/* <Button
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

          <Divider /> */}

          <Button
            onClick={() => dispatch<any>(resetCohortCreation())}
            className={classes.actionButton}
            startIcon={<UpdateSharpIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Réinitialiser</Typography>
          </Button>
        </Grid>
        <Divider />
        <Grid>
          <Grid container justify="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>ACCÈS:</Typography>
            <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
              {accessIsPseudonymize ? 'Pseudonymisé' : 'Nominatif'}
            </Typography>
          </Grid>

          <Grid container justify="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS</Typography>
            {countLoading ? (
              <CircularProgress
                size={12}
                style={{ marginTop: 14 }}
                className={clsx(classes.blueText, classes.sidesMargin)}
              />
            ) : (
              <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
                {includePatient ?? '-'}
              </Typography>
            )}
          </Grid>

          {/* <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Patients vivants</Typography>
            {countLoading ? (
              <CircularProgress size={12} className={clsx(classes.blueText, classes.sidesMargin)} />
            ) : (
              <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{alive ?? '-'}</Typography>
            )}
          </Grid>
          <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Patients décédés</Typography>
            {countLoading ? (
              <CircularProgress size={12} className={clsx(classes.blueText, classes.sidesMargin)} />
            ) : (
              <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{deceased ?? '-'}</Typography>
            )}
          </Grid>
          <Grid container justify="space-between">
            <Typography className={clsx(classes.sidesMargin)}>Nombre de femmes</Typography>
            {countLoading ? (
              <CircularProgress size={12} className={clsx(classes.blueText, classes.sidesMargin)} />
            ) : (
              <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{female ?? '-'}</Typography>
            )}
          </Grid>
          <Grid container justify="space-between">
            <Typography className={classes.sidesMargin}>Nombre d'hommes</Typography>
            {countLoading ? (
              <CircularProgress size={12} className={clsx(classes.blueText, classes.sidesMargin)} />
            ) : (
              <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{male ?? '-'}</Typography>
            )}
            <Grid container justify="space-between">
              <Typography className={classes.sidesMargin}>Nombre d'inconnu</Typography>
              {countLoading ? (
                <CircularProgress size={12} className={clsx(classes.blueText, classes.sidesMargin)} />
              ) : (
                <Typography className={clsx(classes.blueText, classes.sidesMargin)}>{unknownPatient ?? '-'}</Typography>
              )}
            </Grid>
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
