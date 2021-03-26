import React, { useState, useEffect } from 'react'

import { makeStyles, Paper, Grid, Typography, CircularProgress } from '@material-ui/core'

import {
  cohortOrgaRepartitionDataSelector,
  orgaIdsOutOfPractitionerPerimeterSelector,
  areCohortOrgaAccessRequestPendingSelector
} from './CohortSelector'
import BarChart from 'components/Cohort/Preview/Charts/BarChart'
import { useAppSelector, useAppDispatch } from 'state'
import { Alert } from '@material-ui/lab'
import CohortButton from 'common/CohortButton'
import { fetchPractitionerPendingAccessRequests } from 'state/me'
import { unwrapResult } from '@reduxjs/toolkit'
import { createAccessRequest } from 'features/access/AccessRequestSlice'
import { AccessTime } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
  chartOverlay: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(2),
    minHeight: '300px',
    borderRadius: '8px',
    fontSize: '16px'
  },
  chartTitle: {
    borderBottom: '2px inset #E6F1FD',
    paddingBottom: '10px'
  },
  progressContainer: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
}))

type CohortOrgaRepartitionCardProps = {
  loading?: boolean
}

const CohortOrgaRepartitionCard = ({ loading }: CohortOrgaRepartitionCardProps): JSX.Element => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const perimeterRepartitionData = useAppSelector(cohortOrgaRepartitionDataSelector)
  const orgaIdsOutOfPractitionerPerimeter = useAppSelector(orgaIdsOutOfPractitionerPerimeterSelector)
  const pendingData = useAppSelector(areCohortOrgaAccessRequestPendingSelector)
  const [isLoadingPendingReqquests, setIsLoadingPendingRequests] = useState(false)

  const isAllAccessRequestsArePending = pendingData?.pending
  const lastPendingDate = pendingData?.date

  useEffect(() => {
    setIsLoadingPendingRequests(true)
    dispatch(fetchPractitionerPendingAccessRequests())
      .then(unwrapResult)
      .finally(() => setIsLoadingPendingRequests(false))
  }, [dispatch])

  const handleCreateAccessRequests = () => {
    dispatch(createAccessRequest())
      .then(unwrapResult)
      .then(() => {
        setIsLoadingPendingRequests(true)
        dispatch(fetchPractitionerPendingAccessRequests())
          .then(unwrapResult)
          .finally(() => setIsLoadingPendingRequests(false))
      })
  }

  return (
    <Paper className={classes.chartOverlay}>
      <div className={classes.chartTitle}>
        <Typography variant="h3" color="primary">
          Répartition par périmètre
        </Typography>
      </div>
      {loading ? (
        <div className={classes.progressContainer}>
          <CircularProgress />
        </div>
      ) : (
        <Grid container direction="row">
          <Grid item xs={12} lg={6}>
            <BarChart data={perimeterRepartitionData ?? []} width={500} />
          </Grid>
          <Grid item xs={12} lg={6} container alignItems="center">
            {orgaIdsOutOfPractitionerPerimeter && orgaIdsOutOfPractitionerPerimeter.length > 0 && (
              <Alert severity="warning">
                <div className={classes.alertContentContainer}>
                  <Typography gutterBottom>
                    Attention, vous n'avez accès qu'aux patients de cette cohorte faisant partie de votre périmètre
                    d'accès.
                  </Typography>
                  {isAllAccessRequestsArePending ? (
                    <>
                      <Typography>Demande effectuée le {lastPendingDate?.toLocaleDateString()}</Typography>
                      <Typography>
                        <AccessTime color="inherit" /> En attente de retour
                      </Typography>
                    </>
                  ) : (
                    <CohortButton disabled={isLoadingPendingReqquests} onClick={handleCreateAccessRequests}>
                      Demander l'accès aux périmètres manquants
                    </CohortButton>
                  )}
                </div>
              </Alert>
            )}
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

export default CohortOrgaRepartitionCard
