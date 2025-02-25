import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import moment from 'moment'

import { Alert, Container, Grid, Paper, Typography } from '@mui/material'

import NewsCard from 'components/Welcome/NewsCard/NewsCard'
import PatientsCard from 'components/Welcome/PatientsCard/PatientsCard'
import SearchPatientCard from 'components/Welcome/SearchPatientCard/SearchPatientCard'
import TutorialsCard from 'components/Welcome/TutorialsCard/TutorialsCard'
import CohortsTable from 'components/CohortsTable'
import RequestsTable from 'components/Requests/PreviewTable'
import PreviewCard from 'components/ui/Cards/PreviewCard'

import { useAppDispatch, useAppSelector } from 'state'
import { fetchCohorts } from 'state/cohort'
import { fetchProjects } from 'state/project'
import { fetchRequests } from 'state/request'
import { AccessExpiration, RequestType } from 'types'
import useStyles from './styles'
import { CohortsType } from 'types/cohorts'
import { Direction, Order } from 'types/searchCriterias'
import useCohortList from 'hooks/useCohortList'
import { getBannerMessageLevel, sortContent } from 'data/infoMessage'
import { listStaticContents, WebContent } from 'services/aphp/callApi'
import Markdown from 'react-markdown'

const Welcome = () => {
  const { classes, cx } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const practitioner = useAppSelector((state) => state.me)
  const open = useAppSelector((state) => state.drawer)
  const cohortState = useAppSelector((state) => state.cohort)
  const requestState = useAppSelector((state) => state.request)
  const meState = useAppSelector((state) => state.me)
  const [lastRequest, setLastRequest] = useState<RequestType[]>([])
  const [bannerMessages, setBannerMessages] = useState<WebContent[]>([])
  const cohortList = useCohortList()
  const accessExpirations: AccessExpiration[] = meState?.accessExpirations ?? []
  const maintenanceIsActive = meState?.maintenance?.active

  const lastConnection = practitioner?.lastConnection
    ? moment(practitioner.lastConnection).format('[Dernière connexion : ]ddd DD MMMM YYYY[, à ]HH:mm')
    : ''

  const fetchCohortsPreview = () => {
    dispatch(
      fetchCohorts({
        options: {
          limit: 5,
          searchCriterias: {
            searchInput: '',
            orderBy: { orderBy: Order.MODIFIED, orderDirection: Direction.DESC },
            filters: {
              status: [],
              minPatients: null,
              maxPatients: null,
              startDate: null,
              endDate: null,
              favorite: CohortsType.FAVORITE
            }
          }
        }
      })
    )
    dispatch(
      fetchCohorts({
        options: {
          limit: 5
        }
      })
    )
  }

  const fetchBannerMessages = useCallback(async () => {
    const response = await listStaticContents(['BANNER_WARNING', 'BANNER_ERROR', 'BANNER_INFO'])
    setBannerMessages(response)
  }, [])

  useEffect(() => {
    dispatch(fetchProjects())
    dispatch(fetchRequests())
    fetchCohortsPreview()
    fetchBannerMessages()
  }, [])

  useEffect(() => {
    const _lastRequest =
      requestState.requestsList?.length > 0
        ? [...requestState.requestsList]
            .sort((a, b) => +moment(b?.updated_at).format('X') - +moment(a.updated_at).format('X'))
            .splice(0, 5)
        : []
    setLastRequest(_lastRequest)
  }, [requestState])

  return practitioner ? (
    <Grid
      container
      className={cx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container
        maxWidth="lg"
        className={classes.container}
        style={{ minHeight: 'calc(100vh - 70px)', marginBottom: 8 }}
      >
        <Grid item xs={12}>
          <Grid item>
            <Typography
              id="homePage-title"
              component="h1"
              variant="h1"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {`Bienvenue ${
                practitioner.impersonation
                  ? practitioner.impersonation.firstname + ' ' + practitioner.impersonation.lastname
                  : practitioner.displayName
              }`}
            </Typography>
          </Grid>
          <Grid item>
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
          </Grid>
          <Grid item>
            {sortContent(bannerMessages).map((infoMessage) => (
              <Alert
                key={'alertMessage' + infoMessage.id}
                severity={getBannerMessageLevel(infoMessage)}
                className={classes.alert}
              >
                <Markdown components={{ p: 'span' }}>{infoMessage.content}</Markdown>
              </Alert>
            ))}
            {maintenanceIsActive && (
              <Alert severity="warning" className={classes.alert}>
                Une maintenance est en cours. Seules les consultations de cohortes, requêtes et données patients sont
                activées. Les créations, éditions et suppressions de cohortes et de requêtes sont désactivées.
              </Alert>
            )}
            {accessExpirations
              .filter((item) => item.leftDays && !Number.isNaN(item.leftDays) && item.leftDays <= 30)
              .map((item: AccessExpiration) => (
                <Alert
                  key={item.perimeter + '-' + item.leftDays && item.leftDays}
                  severity="warning"
                  className={classes.alert}
                >
                  Attention, votre accès au périmètre suivant: {item.perimeter}, arrivera à expiration dans{' '}
                  {item.leftDays} jour{item.leftDays > 1 ? 's' : ''}. Veuillez vous rapprocher de votre référent EDS
                  pour faire renouveler vos accès à l'application.
                </Alert>
              ))}
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid container className={classes.newsGrid} item xs={12} md={6}>
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

          <Grid container item xs={12} md={6}>
            <Grid item xs={12} className={classes.pt3}>
              <Paper
                id="search-patient-card"
                className={classes.paper}
                style={{ maxHeight: 150, minHeight: 150, height: 150 }}
              >
                <SearchPatientCard />
              </Paper>
            </Grid>

            <Grid item xs={12} className={classes.pt3}>
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

        <Grid container item style={{ paddingTop: 12 }}>
          <Grid item xs={12}>
            <Paper id="favorite-cohort-research-card" className={classes.paper}>
              <PreviewCard
                title={'Mes cohortes favorites'}
                linkLabel={'Voir toutes mes cohortes favorites'}
                onClickLink={() => navigate('/my-cohorts/favorites')}
              >
                <CohortsTable
                  data={cohortState.favoriteCohortsList}
                  loading={cohortState.loading}
                  simplified
                  onUpdate={() => fetchCohortsPreview()}
                />
              </PreviewCard>
            </Paper>
          </Grid>
        </Grid>
        <Grid container item style={{ paddingTop: 12 }}>
          <Grid item xs={12}>
            <Paper id="last-created-cohort-research-card" className={classes.paper}>
              <PreviewCard
                title={'Mes dernières cohortes créées'}
                linkLabel={'Voir toutes mes cohortes'}
                onClickLink={() => navigate('/my-cohorts')}
              >
                <CohortsTable
                  data={cohortList}
                  loading={cohortState.loading}
                  simplified
                  onUpdate={() => fetchCohortsPreview()}
                />
              </PreviewCard>
            </Paper>
          </Grid>
        </Grid>
        <Grid container item style={{ paddingTop: 12 }}>
          <Grid item xs={12}>
            <Paper id="last-created-request-research-card" className={classes.paper}>
              <PreviewCard
                title={'Mes dernières requêtes créées'}
                linkLabel={'Voir toutes mes requêtes'}
                onClickLink={() => navigate('/my-requests')}
              >
                <RequestsTable data={lastRequest} loading={requestState.loading} />
              </PreviewCard>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  ) : null
}

export default Welcome
