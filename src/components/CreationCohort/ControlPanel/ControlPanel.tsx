import React, { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import moment from 'moment'

import { Button, CircularProgress, Divider, Grid, List, ListItem, Tooltip, Typography, Snackbar } from '@mui/material'
import { Alert } from '@mui/lab'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import UpdateSharpIcon from '@mui/icons-material/UpdateSharp'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import InfoIcon from '@mui/icons-material/Info'
import ShareIcon from '@mui/icons-material/Share'

import ModalCohortTitle from '../Modals/ModalCohortTitle/ModalCohortTitle'
import ModalShareRequest from 'components/MyProjects/Modals/ModalShareRequest/ModalShareRequest'

import { useAppSelector, useAppDispatch } from 'state'
import {
  resetCohortCreation,
  countCohortCreation,
  deleteCriteriaGroup,
  buildCohortCreation
} from 'state/cohortCreation'
import { MeState } from 'state/me'

import { RequestType } from 'types'

import useStyle from './styles'

import displayDigit from 'utils/displayDigit'

const DISPLAY_ESTIMATE_LIMIT = 24

const ControlPanel: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string, globalCount: boolean) => void
  onUndo?: () => void
  onRedo?: () => void
}> = ({ onExecute, onUndo, onRedo }) => {
  const classes = useStyle()
  const dispatch = useAppDispatch()
  const [openModal, onSetOpenModal] = useState<'executeCohortConfirmation' | null>(null)
  const [oldCount, setOldCount] = useState<any | null>(null)
  const [openShareRequestModal, setOpenShareRequestModal] = useState<boolean>(false)
  const [shareSuccessOrFailMessage, setShareSuccessOrFailMessage] = useState<'success' | 'error' | null>(null)
  const wrapperSetShareSuccessOrFailMessage = useCallback(
    (val) => {
      setShareSuccessOrFailMessage(val)
    },
    [setShareSuccessOrFailMessage]
  )

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
    requestName,
    json
  } = useAppSelector((state) => state.cohortCreation.request || {})
  const { includePatient, status, jobFailMsg /*byrequest, alive, deceased, female, male, unknownPatient */ } = count

  const [requestShare, setRequestShare] = useState<RequestType | null>({
    currentSnapshot,
    requestId,
    requestName,
    name: '',
    uuid: ''
  })

  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const accessIsPseudonymize: boolean | null =
    selectedPopulation === null
      ? null
      : selectedPopulation
          .map((population: any) => population && population.access)
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
    dispatch<any>(buildCohortCreation({}))
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

  const handleOpenSharedModal = () => {
    setRequestShare({ currentSnapshot, requestId, requestName, name: '', uuid: '' })
    setOpenShareRequestModal(true)
  }
  const handleCloseSharedModal = () => {
    setRequestShare(null)
    setOpenShareRequestModal(false)
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
            disabled={
              itLoads ||
              typeof onExecute !== 'function' ||
              (includePatient ? includePatient > 20000 : false) ||
              maintenanceIsActive
            }
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
            disabled={typeof onUndo !== 'function' || maintenanceIsActive}
            startIcon={<ArrowBackIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Annuler</Typography>
          </Button>

          <Button
            className={classes.actionButton}
            onClick={onRedo}
            disabled={typeof onRedo !== 'function' || maintenanceIsActive}
            startIcon={<ArrowForwardIcon color="action" className={classes.iconBorder} />}
          >
            <Typography className={classes.boldText}>Rétablir</Typography>
          </Button>

          <Button
            onClick={() => {
              dispatch<any>(resetCohortCreation())
            }}
            className={classes.actionButton}
            startIcon={<UpdateSharpIcon color="action" className={classes.iconBorder} />}
            disabled={maintenanceIsActive}
          >
            <Typography className={classes.boldText}>Réinitialiser</Typography>
          </Button>

          <Button
            onClick={() => {
              handleOpenSharedModal()
            }}
            className={classes.actionButton}
            startIcon={<ShareIcon color="action" className={classes.iconBorder} />}
            disabled={maintenanceIsActive}
          >
            <Typography className={classes.boldText}>Partager ma requête</Typography>
          </Button>

          {checkIfLogicalOperatorIsEmpty() && (
            <>
              <Divider />
              <Button
                onClick={cleanLogicalOperator}
                className={classes.actionButton}
                startIcon={<HighlightOffIcon color="action" className={classes.iconBorder} />}
                disabled={maintenanceIsActive}
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

        {!status && !includePatient && (
          <Alert className={classes.errorAlert} severity="info">
            Votre requête ne contient pas de nombre de patient.
            <br />
            <br />
            <Button
              onClick={() => _relaunchCount(false)}
              variant="outlined"
              color="primary"
              size="small"
              style={{ marginTop: -14 }}
              disabled={maintenanceIsActive}
            >
              Relancer la requête
            </Button>
          </Alert>
        )}

        {!!includePatient && includePatient > 20000 && (
          <Alert className={classes.errorAlert} severity="error">
            Il est pour le moment impossible de créer des cohortes de plus de 20 000 patients
          </Alert>
        )}

        {(status === 'failed' || status === 'error') && (
          <Alert className={classes.errorAlert} severity="error">
            Une erreur est survenue lors du calcul du nombre de patients de votre requête.
            <br />
            <Typography style={{ wordBreak: 'break-all' }}>{jobFailMsg}</Typography>
            <br />
            <Button
              onClick={() => _relaunchCount(false)}
              variant="outlined"
              color="secondary"
              size="small"
              style={{ marginTop: -14 }}
              disabled={maintenanceIsActive}
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
              disabled={maintenanceIsActive}
            >
              Relancer la requête
            </Button>
          </Alert>
        )}
      </Grid>

      {openModal === 'executeCohortConfirmation' && (
        <ModalCohortTitle onExecute={onExecute} onClose={() => onSetOpenModal(null)} />
      )}

      {openShareRequestModal && requestShare !== null && requestShare?.currentSnapshot !== undefined && (
        <ModalShareRequest
          shareSuccessOrFailMessage={shareSuccessOrFailMessage}
          parentStateSetter={wrapperSetShareSuccessOrFailMessage}
          requestShare={requestShare}
          onClose={() => handleCloseSharedModal()}
        />
      )}

      {openShareRequestModal && requestShare?.currentSnapshot === undefined && (
        <Snackbar
          open
          onClose={() => handleCloseSharedModal}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => handleCloseSharedModal()}>
            Votre requête ne possède aucun critère. Elle ne peux donc pas être partagée.
          </Alert>
        </Snackbar>
      )}

      {shareSuccessOrFailMessage === 'success' && (
        <Snackbar
          open
          onClose={() => setShareSuccessOrFailMessage(null)}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setShareSuccessOrFailMessage(null)}>
            Votre requête a été partagée.
          </Alert>
        </Snackbar>
      )}

      {shareSuccessOrFailMessage === 'error' && (
        <Snackbar
          open
          onClose={() => setShareSuccessOrFailMessage(null)}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setShareSuccessOrFailMessage(null)}>
            Une erreur est survenue, votre requête n'a pas pu être partagée.
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default ControlPanel
