import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import moment from 'moment'
import clsx from 'clsx'

import { Grid, Paper, Container, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import NewsCard from 'components/Welcome/NewsCard/NewsCard'
import PatientsCard from 'components/Welcome/PatientsCard/PatientsCard'
import ResearchCard from 'components/Welcome/ResearchCard/ResearchCard'
import SearchPatientCard from 'components/Welcome/SearchPatientCard/SearchPatientCard'
import TutorialsCard from 'components/Welcome/TutorialsCard/TutorialsCard'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchProjects } from 'state/project'
import { fetchRequests } from 'state/request'
import { fetchCohorts } from 'state/cohort'
import { initPmsiHierarchy } from 'state/pmsi'
import { initMedicationHierarchy } from 'state/medication'
import { initBiologyHierarchy } from 'state/biology'
import { fetchScopesList } from 'state/scope'

import { Cohort, RequestType } from 'types'

import useStyles from './styles'

const Welcome: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { practitioner, open, cohortState, requestState, meState } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer,
    cohortState: state.cohort,
    requestState: state.request,
    meState: state.me
  }))

  const loadingCohort = cohortState.loading
  const loadingRequest = requestState.loading
  const maintenanceIsActive = meState?.maintenance?.active

  const [favoriteCohorts, setFavoriteCohorts] = useState<Cohort[]>([])
  const [lastCohorts, setLastCohorts] = useState<Cohort[]>([])
  const [lastRequest, setLastRequest] = useState<RequestType[]>([])

  const lastConnection = practitioner?.lastConnection
    ? moment(practitioner.lastConnection).format('[Dernière connexion : ]ddd DD MMMM YYYY[, à ]HH:mm')
    : ''

  useEffect(() => {
    // fetchProjectData
    dispatch<any>(fetchProjects())
    dispatch<any>(fetchRequests())
    dispatch<any>(fetchCohorts())

    // fetchPmsiData
    dispatch<any>(initPmsiHierarchy())

    // fetchMedicationData
    dispatch<any>(initMedicationHierarchy())

    // fetchBiologyData
    dispatch<any>(initBiologyHierarchy())

    // fetchScope
    dispatch<any>(fetchScopesList())
  }, [dispatch])

  useEffect(() => {
    const _favoriteCohorts =
      cohortState.cohortsList?.length > 0
        ? [...cohortState.cohortsList]
            .sort((a, b) => +moment(b?.modified_at).format('X') - +moment(a.modified_at).format('X'))
            .filter((cohortItem) => cohortItem.favorite)
            .splice(0, 5)
        : []
    const _lastCohorts =
      cohortState.cohortsList?.length > 0
        ? [...cohortState.cohortsList]
            .sort((a, b) => +moment(b?.modified_at).format('X') - +moment(a.modified_at).format('X'))
            .splice(0, 5)
        : []
    const _lastRequest =
      requestState.requestsList?.length > 0
        ? [...requestState.requestsList]
            .sort((a, b) => +moment(b?.modified_at).format('X') - +moment(a.modified_at).format('X'))
            .splice(0, 5)
        : []

    setFavoriteCohorts(_favoriteCohorts)
    setLastCohorts(_lastCohorts)
    setLastRequest(_lastRequest)
  }, [cohortState, requestState])

  return practitioner ? (
    <Grid
      container
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container maxWidth="lg" className={classes.container}>
        <Typography id="homePage-title" component="h1" variant="h1" color="inherit" noWrap className={classes.title}>
          Bienvenue {practitioner.displayName}
        </Typography>
        <Typography
          id="last-connection"
          component="h6"
          variant="h6"
          color="inherit"
          noWrap
          className={classes.subtitle}
        >
          {lastConnection}
        </Typography>
      </Container>

      <Container
        maxWidth="lg"
        className={classes.container}
        style={{ minHeight: 'calc(100vh - 70px)', marginBottom: 8 }}
      >
        <Grid container spacing={1}>
          {maintenanceIsActive && (
            <Alert severity="warning" style={{ marginTop: '-12px', width: '100%' }}>
              Une maintenance est en cours. Seule la consultation des cohorts, requetes et données patients est activée.
              Toute création, édition et suppression de cohort/requete est desactivées.
            </Alert>
          )}

          <Grid container className={classes.newsGrid} item xs={12} md={6} lg={6}>
            <Grid item className={classes.pt3}>
              <Paper
                id="patients-card"
                className={classes.paper}
                style={{ maxHeight: 150, minHeight: 150, height: 150 }}
              >
                <PatientsCard />
              </Paper>
            </Grid>

            <Grid item className={classes.pt3}>
              <Paper id="news-card" className={classes.paper} style={{ maxHeight: 450, minHeight: 450, height: 450 }}>
                <NewsCard />
              </Paper>
            </Grid>
          </Grid>

          <Grid container item xs={12} md={6} lg={6}>
            <Grid item xs={12} md={12} lg={12} className={classes.pt3}>
              <Paper
                id="search-patient-card"
                className={classes.paper}
                style={{ maxHeight: 150, minHeight: 150, height: 150 }}
              >
                <SearchPatientCard />
              </Paper>
            </Grid>

            <Grid item xs={12} md={12} lg={12} className={classes.pt3}>
              <Paper
                id="tutorials-card"
                className={classes.paper}
                style={{ maxHeight: 450, minHeight: 450, height: 450 }}
              >
                <TutorialsCard />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={3} style={{ paddingTop: 8 }}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper id="favorite-cohort-research-card" className={classes.paper}>
              <ResearchCard
                title={'Mes cohortes favorites'}
                linkLabel={'Voir toutes mes cohortes favorites'}
                onClickLink={() => history.push('/my-cohorts?fav=true')}
                loading={loadingCohort}
                cohorts={favoriteCohorts}
                isFav
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper id="last-created-cohort-research-card" className={classes.paper}>
              <ResearchCard
                title={'Mes dernières cohortes créées'}
                linkLabel={'Voir toutes mes cohortes'}
                onClickLink={() => history.push('/my-cohorts')}
                loading={loadingCohort}
                cohorts={lastCohorts}
              />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper id="last-created-request-research-card" className={classes.paper}>
              <ResearchCard
                title={'Mes dernières requêtes créées'}
                linkLabel={'Voir toutes mes requêtes'}
                onClickLink={() => history.push('/my-requests')}
                loading={loadingRequest}
                requests={lastRequest}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  ) : null
}

export default Welcome
