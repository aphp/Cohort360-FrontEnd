import React, { useEffect } from 'react'
import moment from 'moment'
import clsx from 'clsx'
import { Grid, Paper, Container, Typography } from '@material-ui/core'

import NewsCard from '../../components/Welcome/NewsCard/NewsCard'
import PatientsCard from '../../components/Welcome/PatientsCard/PatientsCard'
import ResearchCard from '../../components/Welcome/ResearchCard/ResearchCard'
import SearchPatientCard from '../../components/Welcome/SearchPatientCard/SearchPatientCard'
import TutorialsCard from '../../components/Welcome/TutorialsCard/TutorialsCard'

import { useAppSelector, useAppDispatch } from 'state'
import { initUserCohortsThunk } from 'state/userCohorts'

import useStyles from './styles'

const Accueil: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { practitioner, open, favoriteCohorts, lastCohorts } = useAppSelector((state) => ({
    practitioner: state.me,
    open: state.drawer,
    favoriteCohorts: state.userCohorts.favoriteCohorts,
    lastCohorts: state.userCohorts.lastCohorts
  }))

  const lastConnection = practitioner?.lastConnection
    ? moment(practitioner.lastConnection).format('[Dernière connexion: ]ddd DD MMMM YYYY[, à ]HH:mm')
    : ''

  useEffect(() => {
    dispatch(initUserCohortsThunk())
  }, [dispatch])

  return practitioner ? (
    <Grid
      container
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container maxWidth="lg" className={classes.container}>
        <Typography component="h1" variant="h1" color="inherit" noWrap className={classes.title}>
          Bienvenue {practitioner.displayName}
        </Typography>
        <Typography component="h6" variant="h6" color="inherit" noWrap className={classes.title}>
          {lastConnection}
        </Typography>
      </Container>
      <Container maxWidth="lg" className={classes.container} style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <Grid item>
              <Paper className={classes.paper}>
                <PatientsCard />
              </Paper>
            </Grid>
            <Grid item className={classes.pt3}>
              <Paper className={classes.paper}>
                <SearchPatientCard />
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper className={classes.paper}>
                <NewsCard />
              </Paper>
            </Grid>
            <Grid item xs={12} md={12} lg={12} className={classes.pt3}>
              <Paper className={classes.paper}>
                <TutorialsCard />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <ResearchCard title={'Mes cohortes favorites'} cohorts={favoriteCohorts} />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <ResearchCard title={'Mes dernières cohortes créées'} cohorts={lastCohorts} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  ) : null
}

export default Accueil
