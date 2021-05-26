import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import { Button, CircularProgress, Divider, Grid, Tooltip, Typography } from '@material-ui/core'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'

import ModalCohortTitle from '../Modals/ModalCohortTitle/ModalCohortTitle'

import { useAppSelector } from 'state'
import {
  resetCohortCreation,
  countCohortCreation,
  editCriteriaGroup,
  deleteCriteriaGroup,
  buildCohortCreation
} from 'state/cohortCreation'
import { setSelectedRequest } from 'state/request'

import useStyle from './styles'

import displayDigit from 'utils/displayDigit'

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
    saveLoading = false,
    countLoading = false,
    count = {},
    criteriaGroup = [],
    selectedPopulation = []
  } = useAppSelector((state) => state.cohortCreation.request || {})
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

  const checkIfLogicalOperatorIsEmpty = () => {
    let _criteriaGroup = criteriaGroup ? criteriaGroup : []
    _criteriaGroup = _criteriaGroup.filter(({ id }) => id !== 0)

    return _criteriaGroup && _criteriaGroup.length > 0
      ? _criteriaGroup.filter(({ criteriaIds }) => criteriaIds.length === 0).length > 0
      : false
  }

  const cleanLogicalOperator = () => {
    let _criteriaGroup = criteriaGroup ? criteriaGroup : []
    _criteriaGroup = _criteriaGroup.filter(({ id }) => id !== 0)

    const logicalOperatorNeedToBeErase =
      _criteriaGroup && _criteriaGroup.length > 0
        ? _criteriaGroup.filter(({ criteriaIds }) => criteriaIds.length === 0)
        : []

    if (logicalOperatorNeedToBeErase && logicalOperatorNeedToBeErase.length > 0) {
      for (const logicalOperator of logicalOperatorNeedToBeErase) {
        const { id } = logicalOperator
        dispatch<any>(deleteCriteriaGroup(id))

        const logicalOperatorParent = criteriaGroup
          ? criteriaGroup.find(({ criteriaIds }) => criteriaIds.find((_criteriaId) => _criteriaId === id))
          : undefined
        if (!logicalOperatorParent) return
        dispatch<any>(
          editCriteriaGroup({
            ...logicalOperatorParent,
            criteriaIds: logicalOperatorParent.criteriaIds.filter((_criteriaId) => _criteriaId !== id)
          })
        )
      }
    }
    dispatch(buildCohortCreation({}))
  }

  const itLoads = loading || countLoading || saveLoading

  return (
    <>
      <Grid className={classes.rightPanelContainerStyle}>
        <Grid className={classes.container}>
          <Button
            disabled={itLoads || typeof onExecute !== 'function'}
            onClick={() => onSetOpenModal('executeCohortConfirmation')}
            className={classes.requestExecution}
          >
            {itLoads ? (
              <>
                Veuillez patienter
                <CircularProgress style={{ marginLeft: '15px' }} size={30} />
              </>
            ) : (
              <>Créer la cohorte</>
            )}
          </Button>

          <Button
            className={classes.actionButton}
            onClick={onUndo}
            disabled={typeof onUndo !== 'function'}
            startIcon={<ArrowBackIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Annuler</Typography>
          </Button>

          <Button
            className={classes.actionButton}
            onClick={onRedo}
            disabled={typeof onRedo !== 'function'}
            startIcon={<ArrowForwardIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Rétablir</Typography>
          </Button>

          <Button
            onClick={() => {
              dispatch<any>(setSelectedRequest({ uuid: '', name: '' }))
              dispatch<any>(resetCohortCreation())
            }}
            className={classes.actionButton}
            startIcon={<UpdateSharpIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Réinitialiser</Typography>
          </Button>

          {checkIfLogicalOperatorIsEmpty() && (
            <>
              <Divider />
              <Button
                onClick={cleanLogicalOperator}
                className={classes.actionButton}
                startIcon={<HighlightOffIcon color="action" className={classes.iconBorder} />}
              >
                <Tooltip title="Supprimer les groupes ne contenant aucun élément">
                  <Typography className={classes.boldText}>Nettoyer le diagramme</Typography>
                </Tooltip>
              </Button>
            </>
          )}
        </Grid>

        <Grid className={classes.container}>
          <Grid container justify="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>ACCÈS:</Typography>
            <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
              {accessIsPseudonymize ? 'Pseudonymisé' : 'Nominatif'}
            </Typography>
          </Grid>
        </Grid>

        <Grid className={classes.container}>
          <Grid container justify="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS</Typography>
            {itLoads ? (
              <CircularProgress
                size={12}
                style={{ marginTop: 14 }}
                className={clsx(classes.blueText, classes.sidesMargin)}
              />
            ) : (
              <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
                {includePatient ? displayDigit(includePatient) : '-'}
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
