/* eslint-disable max-statements */
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import moment from 'moment'

import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormControl,
  Grid,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Switch,
  Tooltip,
  Typography,
  Snackbar
} from '@mui/material'

import DescriptionIcon from '@mui/icons-material/Description'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import InfoIcon from '@mui/icons-material/Info'
import ShareIcon from '@mui/icons-material/Share'

import ModalCohortTitle from '../Modals/ModalCohortTitle/ModalCohortTitle'
import ModalShareRequest from 'components/Researches/Modals/ModalShareRequest'
import VersionsDialog from './Versions/VersionsDialog'
import VersionsSection from './Versions'

import { useAppSelector, useAppDispatch } from 'state'
import {
  countCohortCreation,
  deleteCriteriaGroup,
  buildCohortCreation,
  unbuildCohortCreation,
  addActionToNavHistory,
  updateCount,
  editSnapshotHistory
} from 'state/cohortCreation'

import {
  CohortCount,
  JobStatus,
  CurrentSnapshot,
  LoadingStatus,
  RequestType,
  Snapshot,
  WSJobStatus,
  QuerySnapshotInfo
} from 'types'

import useStyle from './styles'

import { format } from 'utils/numbers'
import services from 'services/aphp'
import ValidationDialog from 'components/ui/ValidationDialog'
import { JToolComponentEggWrapper } from 'components/Impersonation/JTool'
import { Egg3 } from 'components/Impersonation/Eggs'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import { AppConfig } from 'config'
import { setRequestDetailedMode } from 'state/preferences'
import { hasStageDetails } from '../DiagramView/components/CriteriaCount'
import { isRequestFinished } from './utils'
import { CriteriaType } from 'types/requestCriterias'

const ControlPanel: React.FC<{
  onExecute?: (cohortName: string, cohortDescription: string, globalCount: boolean) => void
}> = ({ onExecute }) => {
  const { classes, cx } = useStyle()
  const dispatch = useAppDispatch()
  const appConfig = useContext(AppConfig)
  const [openModal, setOpenModal] = useState<'executeCohortConfirmation' | null>(null)
  const [oldCount, setOldCount] = useState<CohortCount | null>(null)
  const [openShareRequestModal, setOpenShareRequestModal] = useState<boolean>(false)
  const [countLoading, setCountLoading] = useState<LoadingStatus>(LoadingStatus.IDDLE)
  const [reportLoading, setReportLoading] = useState<LoadingStatus>(LoadingStatus.IDDLE)
  const [reportError, setReportError] = useState(false)
  const [openReportConfirmation, setOpenReportConfirmation] = useState<boolean>(false)
  const [openVersionsDialog, setOpenVersionsDialog] = useState<boolean>(false)

  const {
    loading = false,
    saveLoading = false,
    count = {},
    criteriaGroup = [],
    selectedCriteria = [],
    selectedPopulation = [],
    currentSnapshot,
    navHistory,
    requestId,
    requestName,
    json,
    count_outdated,
    snapshotsHistory
  } = useAppSelector((state) => state.cohortCreation.request || {})
  const { detailedMode } = useAppSelector((state) => state.preferences.requests)
  const { includePatient, status, jobFailMsg } = count
  const [requestShare, setRequestShare] = useState<RequestType | null>({
    currentSnapshot,
    requestId,
    requestName,
    name: '',
    uuid: ''
  })
  const [criteriaDetailCalculation, setCriteriaDetailCalculation] = useState<boolean>(
    isRequestFinished(count) ? !!hasStageDetails(count.extra) : !!detailedMode && !!requestId
  )
  const [detailCalculationType, setDetailCalculationType] = useState<'all' | 'ratio'>(
    (isRequestFinished(count) ? hasStageDetails(count.extra) : detailedMode) ?? 'all'
  )
  const [prevCountDisplay, setPrevCountDisplay] = useState<number | undefined>()

  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const cohortLimit = appConfig.features.cohort.shortCohortLimit

  const hasClaim = useMemo(
    () => selectedCriteria.some((criteria) => criteria.type === CriteriaType.CLAIM),
    [selectedCriteria]
  )

  const accessIsPseudonymize: boolean | null =
    selectedPopulation === null
      ? null
      : selectedPopulation
          .map((population) => population && population.access)
          .filter((elem) => elem && elem === 'Pseudonymisé').length > 0

  const checkIfLogicalOperatorIsEmpty = () => {
    let _criteriaGroup = criteriaGroup || []
    _criteriaGroup = _criteriaGroup.filter(({ id }) => id !== 0)

    return _criteriaGroup && _criteriaGroup.length > 0
      ? _criteriaGroup.filter(({ criteriaIds }) => criteriaIds.length === 0).length > 0
      : false
  }

  const cleanLogicalOperator = () => {
    let _criteriaGroup = criteriaGroup || []
    _criteriaGroup = _criteriaGroup.filter(({ id }) => id !== 0)

    const logicalOperatorNeedToBeErase =
      _criteriaGroup && _criteriaGroup.length > 0
        ? _criteriaGroup.filter(({ criteriaIds }) => criteriaIds.length === 0)
        : []

    if (logicalOperatorNeedToBeErase && logicalOperatorNeedToBeErase.length > 0) {
      for (const logicalOperator of logicalOperatorNeedToBeErase) {
        const { id } = logicalOperator
        dispatch(deleteCriteriaGroup(id))
      }
    }
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const _relaunchCount = (keepCount: boolean) => {
    if (keepCount) setOldCount(count ?? null)
    dispatch(
      countCohortCreation({
        json,
        snapshotId: currentSnapshot.uuid,
        requestId
      })
    )
  }

  const handleDeleteGhm = () => {
    dispatch(buildCohortCreation({ selectedPopulation: null }))
  }

  const handleOpenSharedModal = () => {
    setRequestShare({ currentSnapshot, requestId, requestName, name: '', uuid: '' })
    setOpenShareRequestModal(true)
  }
  const handleCloseSharedModal = () => {
    setRequestShare(null)
    setOpenShareRequestModal(false)
  }

  const handleVersionUpdate = (updatedVersion: QuerySnapshotInfo) => {
    dispatch(editSnapshotHistory(updatedVersion))
  }

  const getNewNavHistoryIndex = (navHistory: CurrentSnapshot[], previousSnapshot: CurrentSnapshot) => {
    let newNavHistoryIndex = 0
    const previousNavHistoryIndex = previousSnapshot.navHistoryIndex
    if (navHistory.length - 1 > previousNavHistoryIndex) {
      newNavHistoryIndex = previousNavHistoryIndex + 1
    } else {
      newNavHistoryIndex = navHistory.length
    }
    return newNavHistoryIndex
  }

  const handleSnapshotChange = async (snapshotId: string) => {
    if (currentSnapshot.uuid !== snapshotId) {
      const snapshot: Snapshot = await services.cohortCreation.fetchSnapshot(snapshotId)
      const newNavHistoryIndex = getNewNavHistoryIndex(navHistory, currentSnapshot)
      const newCurrentSnapshot: CurrentSnapshot = { ...snapshot, navHistoryIndex: newNavHistoryIndex }

      dispatch(addActionToNavHistory(newCurrentSnapshot))
      dispatch(unbuildCohortCreation({ newCurrentSnapshot }))
    }
  }

  const handleGenerateReport = async () => {
    try {
      setOpenReportConfirmation(true)
      setReportLoading(LoadingStatus.FETCHING)
      const sendReport = await services.cohortCreation.createReport(currentSnapshot.uuid)
      if (sendReport?.status) {
        setReportError(false)
      } else {
        setReportError(true)
      }
      setReportLoading(LoadingStatus.SUCCESS)
    } catch (error) {
      console.error(error)
      setReportLoading(LoadingStatus.IDDLE)
      setReportError(true)
    }
  }

  const isLoading = loading || countLoading === LoadingStatus.FETCHING || saveLoading
  const errorCriteria = selectedCriteria.filter((criteria) => criteria.error)
  const lastUpdated = moment(count.date)
  const lastUpdatedOldCount = oldCount ? moment(oldCount.date) : null

  const webSocketContext = useContext(WebSocketContext)

  useEffect(() => {
    const newModeOptionStageDetails = criteriaDetailCalculation ? detailCalculationType : null
    if (detailedMode !== newModeOptionStageDetails) {
      dispatch(setRequestDetailedMode(newModeOptionStageDetails))
      const stageDetails = hasStageDetails(count.extra)
      if (stageDetails !== newModeOptionStageDetails && newModeOptionStageDetails !== null) {
        setPrevCountDisplay(includePatient)
        const countTask = setTimeout(() => {
          _relaunchCount(false)
        }, 1500)
        return () => clearTimeout(countTask)
      }
    }
    // I don't want to trigger the effect when the detailedMode is updated or _relaunchCount is updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailCalculationType, criteriaDetailCalculation])

  useEffect(() => {
    if (isRequestFinished(count)) {
      const stageDetails = hasStageDetails(count.extra)
      if (stageDetails !== detailCalculationType) {
        setDetailCalculationType(stageDetails ?? 'all')
        setCriteriaDetailCalculation(!!stageDetails)
      }
    }
  }, [count])

  useEffect(() => {
    if (status && (status === JobStatus.NEW || status === JobStatus.PENDING || status === JobStatus.STARTED)) {
      setCountLoading(LoadingStatus.FETCHING)
      //TODO: refacto the lunch of the count in the app colision with buildCohortCreation and unbuildCohortCreation
      // dispatch(countCohortCreation({ uuid: uuid }))
    } else setCountLoading(LoadingStatus.SUCCESS)
  }, [status /*dispatch, status, uuid*/])

  useEffect(() => {
    const listener = (message: WSJobStatus) => {
      let response = {}
      if (message.status !== JobStatus.PENDING && message.uuid === count.uuid) {
        setCountLoading(LoadingStatus.SUCCESS)
        response = {
          includePatient: message.extra_info?.measure,
          extra: message.extra_info?.extra,
          status: message.status,
          jobFailMsg: message.extra_info?.request_job_fail_msg,
          snapshotId: message.extra_info?.snapshot_id
        }
        dispatch(updateCount(response))
        setPrevCountDisplay(undefined)
      }
      if (message.status === JobStatus.FINISHED) {
        const versionToUpdate = snapshotsHistory.find((v) => v.uuid === message.extra_info?.snapshot_id)
        if (versionToUpdate) {
          const updatedVersion: QuerySnapshotInfo = {
            ...versionToUpdate,
            patients_count: message.extra_info?.measure
          }
          dispatch(editSnapshotHistory(updatedVersion))
        }
      }
    }

    webSocketContext?.addListener(listener)
    return () => webSocketContext?.removeListener(listener)
  }, [webSocketContext, count.uuid, dispatch])

  return (
    <>
      <Grid className={classes.rightPanelContainerStyle}>
        <Grid className={classes.container}>
          <Button
            disabled={
              isLoading ||
              typeof onExecute !== 'function' ||
              maintenanceIsActive ||
              count_outdated ||
              includePatient === 0 ||
              hasClaim
            }
            onClick={() => setOpenModal('executeCohortConfirmation')}
            className={classes.requestExecution}
            style={{ marginTop: 12, marginBottom: 6 }}
          >
            {isLoading ? (
              <>
                Veuillez patienter
                <CircularProgress style={{ marginLeft: '15px' }} size={30} />
              </>
            ) : (
              <>Créer la cohorte</>
            )}
          </Button>
          {appConfig.features.feasibilityReport.enabled && (
            <Button
              disabled={
                isLoading || typeof onExecute !== 'function' || maintenanceIsActive || count_outdated || hasClaim
              }
              onClick={handleGenerateReport}
              className={classes.requestExecution}
              startIcon={<DescriptionIcon color="action" className={classes.iconBorder} />}
              style={{ marginBottom: 12 }}
            >
              {isLoading ? (
                <>
                  Veuillez patienter
                  <CircularProgress style={{ marginLeft: '15px' }} size={30} />
                </>
              ) : (
                <>Générer un rapport</>
              )}
            </Button>
          )}

          <Button
            onClick={() => {
              handleOpenSharedModal()
            }}
            className={classes.actionButton}
            startIcon={<ShareIcon color="action" className={classes.iconBorder} />}
            disabled={maintenanceIsActive || hasClaim}
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
                disabled={maintenanceIsActive || hasClaim}
              >
                <Tooltip title="Supprimer les groupes ne contenant aucun élément">
                  <Typography className={classes.boldText}>Nettoyer le diagramme</Typography>
                </Tooltip>
              </Button>
            </>
          )}
        </Grid>
        <Grid container className={classes.container}>
          <Grid container size={12} justifyContent="space-between">
            <Typography className={cx(classes.boldText, classes.patientTypo)}>ACCÈS :</Typography>
            <Typography className={cx(classes.blueText, classes.boldText, classes.patientTypo)}>
              {accessIsPseudonymize === null ? '-' : accessIsPseudonymize ? 'Pseudonymisé' : 'Nominatif'}
            </Typography>
          </Grid>
        </Grid>

        <JToolComponentEggWrapper>
          {!isLoading && (count.date ? moment(count.date).diff(moment.now()) > -100000 : false) && (
            <Egg3 count={includePatient} />
          )}
        </JToolComponentEggWrapper>

        <Grid container className={classes.container}>
          <Grid container size={12} justifyContent="space-between">
            <Typography className={cx(classes.boldText, classes.patientTypo)}>PATIENTS INCLUS :</Typography>
            {isLoading && prevCountDisplay === undefined ? (
              <CircularProgress
                size={12}
                style={{ marginTop: 14 }}
                className={cx(classes.blueText, classes.sidesMargin)}
              />
            ) : (
              <Grid container alignItems="center" style={{ width: 'fit-content' }}>
                <Typography className={cx(classes.boldText, classes.patientTypo, classes.blueText)}>
                  {format(includePatient ?? prevCountDisplay)}
                  {oldCount !== null && !!oldCount.includePatient
                    ? (includePatient ?? 0) - oldCount.includePatient > 0
                      ? ` (+${(includePatient ?? 0) - oldCount.includePatient})`
                      : ` (${(includePatient ?? 0) - oldCount.includePatient})`
                    : ''}
                </Typography>
                {oldCount !== null && !!oldCount.includePatient && (
                  <Tooltip
                    title={`Le delta ${
                      (includePatient ?? 0) - oldCount.includePatient > 0
                        ? ` (+${(includePatient ?? 0) - oldCount.includePatient})`
                        : ` (${(includePatient ?? 0) - oldCount.includePatient})`
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
        <Grid className={classes.container}>
          <Grid container direction="column" style={{ width: '100%', padding: '10px' }}>
            <Typography className={classes.boldText}>INFORMATIONS SUPPLEMENTAIRES :</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={criteriaDetailCalculation}
                  onChange={(e) => {
                    setCriteriaDetailCalculation(e.target.checked)
                  }}
                  color="primary"
                  disabled={maintenanceIsActive || hasClaim}
                />
              }
              label="Calcul sur la population source"
              style={{ marginLeft: 0 }}
            />
            {criteriaDetailCalculation && (
              <>
                <Typography style={{ backgroundColor: '#f5f5f5', padding: '8px', marginTop: '10px' }}>
                  Sélectionnez le calcul que vous souhaitez activer
                </Typography>
                <FormControl component="fieldset" style={{ marginTop: '10px' }}>
                  <RadioGroup
                    value={detailCalculationType}
                    onChange={(e) => setDetailCalculationType(e.target.value as 'all' | 'ratio')}
                  >
                    <FormControlLabel
                      value="all"
                      control={<Radio disabled={maintenanceIsActive || hasClaim} />}
                      label="Chiffres"
                    />
                    <FormControlLabel
                      value="ratio"
                      control={<Radio disabled={maintenanceIsActive || hasClaim} />}
                      label="Pourcentages"
                    />
                  </RadioGroup>
                </FormControl>
              </>
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
              size="small"
              style={{ marginTop: -14 }}
              disabled={maintenanceIsActive}
            >
              Relancer la requête
            </Button>
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
              En effet, la nouvelle version du requêteur n'est pas compatible avec l'ancien paramétrage.
            </Typography>
            <Typography>Ce problème est temporaire. Une solution est en cours de développement.</Typography>
          </Alert>
        )}
        {count_outdated && (
          <Alert className={classes.errorAlert} severity="error">
            Attention, l'estimation du nombre de patients correspondant à votre requête effectuée le{' '}
            {lastUpdated.format('DD/MM/YYYY')} est dépassée, vous devez la recalculer avant de pouvoir créer une
            cohorte.
            <Button
              onClick={() => _relaunchCount(true)}
              variant="outlined"
              color="secondary"
              size="small"
              style={{ marginTop: 8 }}
              disabled={maintenanceIsActive}
            >
              Relancer la requête
            </Button>
          </Alert>
        )}
        {hasClaim && (
          <Alert className={classes.errorAlert} severity="error">
            Vous devez relancer votre requête pour avoir un nombre de patients à jour et créer une cohorte.
            <div>
              <Button
                onClick={handleDeleteGhm}
                variant="outlined"
                color="secondary"
                size="small"
                style={{ marginTop: 8 }}
                disabled={maintenanceIsActive}
              >
                Relancer sans GHM
              </Button>
            </div>
          </Alert>
        )}
        <VersionsSection
          snapshotsHistory={snapshotsHistory}
          currentSnapshot={currentSnapshot}
          onSnapshotChange={handleSnapshotChange}
          onOpenVersionsDialog={() => setOpenVersionsDialog(true)}
          classes={classes}
        />
      </Grid>

      {openModal === 'executeCohortConfirmation' && (
        <ModalCohortTitle
          onExecute={onExecute}
          onClose={() => setOpenModal(null)}
          longCohort={includePatient ? includePatient > cohortLimit : false}
          cohortLimit={cohortLimit}
        />
      )}

      {openReportConfirmation && (
        <ValidationDialog
          open
          loading={reportLoading}
          onClose={() => setOpenReportConfirmation(false)}
          error={reportError}
          message={
            'Votre demande a bien été prise en compte. Vous recevrez un email de confirmation lorsque le rapport sera prêt.'
          }
        />
      )}

      {requestShare?.currentSnapshot !== undefined && (
        <ModalShareRequest
          open={openShareRequestModal}
          requestToShare={requestShare}
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
            Votre requête ne possède aucun critère. Elle ne peut donc pas être partagée.
          </Alert>
        </Snackbar>
      )}

      {openVersionsDialog && (
        <VersionsDialog
          open={openVersionsDialog}
          onClose={() => setOpenVersionsDialog(false)}
          versions={snapshotsHistory}
          onVersionUpdate={handleVersionUpdate}
        />
      )}
    </>
  )
}

export default ControlPanel
