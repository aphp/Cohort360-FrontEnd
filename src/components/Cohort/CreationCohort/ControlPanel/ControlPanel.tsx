import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'
import moment from 'moment'

import { Button, CircularProgress, Divider, Grid, List, ListItem, Tooltip, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import InfoIcon from '@material-ui/icons/Info'

import ModalCohortTitle from '../Modals/ModalCohortTitle/ModalCohortTitle'

import { useAppSelector } from 'state'
import {
  resetCohortCreation,
  countCohortCreation,
  deleteCriteriaGroup,
  buildCohortCreation
} from 'state/cohortCreation'
import { setSelectedRequest } from 'state/request'

import useStyle from './styles'

import displayDigit from 'utils/displayDigit'

const DISPLAY_ESTIMATE_LIMIT = 24

const ControlPanel: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string, globalCount: boolean) => void
  onUndo?: () => void
  onRedo?: () => void
}> = ({ onExecute, onUndo, onRedo }) => {
  const classes = useStyle()
  const dispatch = useDispatch()
  const [openModal, onSetOpenModal] = useState<'executeCohortConfirmation' | null>(null)
  const [oldCount, setOldCount] = useState<any | null>(null)

  const {
    loading = false,
    saveLoading = false,
    countLoading = false,
    count = {},
    criteriaGroup = [],
    selectedCriteria = [],
    selectedPopulation = [],
    currentSnapshot,
    requestId,
    json
  } = useAppSelector((state) => state.cohortCreation.request || {})
  const { includePatient, status, jobFailMsg /*byrequest, alive, deceased, female, male, unknownPatient */ } = count

  const accessIsPseudonymize: boolean | null =
    selectedPopulation === null
      ? null
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

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
      }
    }
    dispatch(buildCohortCreation({}))
  }

  const _relaunchCount = (keepCount: boolean) => {
    if (keepCount) setOldCount(count ?? null)
    dispatch<any>(
      countCohortCreation({
        json,
        snapshotId: currentSnapshot,
        requestId
      })
    )
  }

  const itLoads = loading || countLoading || saveLoading
  const errorCriteria = selectedCriteria.filter((criteria) => criteria.error)
  const lastUpdated = moment(count.date)
  const lastUpdatedOldCount = oldCount ? moment(oldCount.date) : null

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
        <Grid className={classes.container}>
          <Button
            disabled={itLoads || typeof onExecute !== 'function' || (includePatient ? includePatient > 20000 : false)}
            onClick={
              includePatient && includePatient > 20000 ? undefined : () => onSetOpenModal('executeCohortConfirmation')
            }
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
          <Grid container justifyContent="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>ACCÈS:</Typography>
            <Typography className={clsx(classes.blueText, classes.boldText, classes.patientTypo)}>
              {accessIsPseudonymize === null ? '-' : accessIsPseudonymize ? 'Pseudonymisé' : 'Nominatif'}
            </Typography>
          </Grid>
        </Grid>

        <Grid className={classes.container}>
          <Grid container justifyContent="space-between">
            <Typography className={clsx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS</Typography>
            {itLoads ? (
              <CircularProgress
                size={12}
                style={{ marginTop: 14 }}
                className={clsx(classes.blueText, classes.sidesMargin)}
              />
            ) : (
              <Grid container alignItems="center" style={{ width: 'fit-content' }}>
                <Typography
                  className={clsx(classes.boldText, classes.patientTypo, {
                    [classes.blueText]: includePatient ? includePatient <= 20000 : true,
                    [classes.redText]: includePatient ? includePatient > 20000 : false
                  })}
                >
                  {includePatient !== undefined && includePatient !== null ? displayDigit(includePatient) : '-'}
                  {oldCount !== null
                    ? (includePatient ?? 0) - oldCount?.includePatient > 0
                      ? ` (+${(includePatient ?? 0) - oldCount?.includePatient})`
                      : ` (${(includePatient ?? 0) - oldCount?.includePatient})`
                    : ''}
                </Typography>
                {oldCount !== null && (
                  <Tooltip
                    title={`Le delta ${
                      (includePatient ?? 0) - oldCount?.includePatient > 0
                        ? ` (+${(includePatient ?? 0) - oldCount?.includePatient})`
                        : ` (${(includePatient ?? 0) - oldCount?.includePatient})`
                    } est la différence de patient entre le ${lastUpdatedOldCount?.format(
                      'DD/MM/YYYY'
                    )} et la date du jour.`}
                  >
                    <InfoIcon />
                  </Tooltip>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>

        {!!includePatient && includePatient > 20000 && (
          <Alert className={classes.errorAlert} severity="error">
            Il est pour le moment impossible de créer des cohortes de plus de 20 000 patients
          </Alert>
        )}

        {(status === 'failed' || status === 'error') && (
          <Alert className={classes.errorAlert} severity="error">
            Une erreur est survenue lors du calcul du nombre de patients de votre requête. <br />
            {jobFailMsg}
            <Button
              onClick={() => _relaunchCount(false)}
              variant="outlined"
              color="secondary"
              size="small"
              style={{ marginTop: 8 }}
            >
              Relancer la requête
            </Button>
          </Alert>
        )}

        {errorCriteria && errorCriteria.length > 0 && (
          <Alert className={classes.errorAlert} severity="error">
            Les critères suivants sont obsolètes : <br />
            <List>
              {errorCriteria.map((errorCrit) => (
                <ListItem key={errorCrit.id}>{errorCrit.title}</ListItem>
              ))}
            </List>
            <Typography>Merci de recréer ces critères avant de relancer la requête.</Typography>
            <Typography>
              En effet, la nouvelle version du requeteur n'est pas compatible avec l'ancien paramétrage.
            </Typography>
            <Typography>Ce problème est temporaire. Une solution est en cours de développement.</Typography>
          </Alert>
        )}

        {moment().diff(lastUpdated, 'hours') > DISPLAY_ESTIMATE_LIMIT && (
          <Alert className={classes.errorAlert} severity="info">
            Attention l'estimation du nombre de patients correspondant à votre requête effectuée le{' '}
            {lastUpdated.format('DD/MM/YYYY')} est peut être dépassée, voulez vous la recalculer ?
            <Button
              onClick={() => _relaunchCount(true)}
              variant="outlined"
              color="primary"
              size="small"
              style={{ marginTop: 8 }}
            >
              Relancer la requête
            </Button>
          </Alert>
        )}
      </Grid>

      {openModal === 'executeCohortConfirmation' && (
        <ModalCohortTitle onExecute={onExecute} onClose={() => onSetOpenModal(null)} />
      )}
    </>
  )
}

export default ControlPanel
