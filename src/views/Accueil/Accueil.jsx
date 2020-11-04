import React from 'react'
import clsx from 'clsx'
import { Grid, Paper, Container, Typography } from '@material-ui/core'
import SearchPatientCard from '../../components/Welcome/SearchPatientCard/SearchPatientCard'
import PatientsCard from '../../components/Welcome/PatientsCard/PatientsCard'
import NewsCard from '../../components/Welcome/NewsCard/NewsCard'
import TutorialsCard from '../../components/Welcome/TutorialsCard/TutorialsCard'
import FavResearch from '../../components/Welcome/FavResearchCard/FavResearchCard'
import LastResearch from '../../components/Welcome/LastResearchCard/LastResearchCard'

import useStyles from './style'
import { useSelector, useDispatch } from 'react-redux'
import {loadPractitioner as loadPractitionerAction} from '../../state/practitioner'
import api from '../../services/api'

const Accueil = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const practitioner = useSelector((state) => state.me)
  const open = useSelector((state) => state.drawer)

  const getPractitioner = async () => {
    const practitionerId = await api.get(`/Practitioner?identifier=${practitioner.username}`)
    dispatch(
      loadPractitionerAction(
        practitionerId.data.entry[0].resource.id
    ))
  }

  getPractitioner()

  return (
    <Grid
      container
      position="fixed"
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Container maxWidth="lg" className={classes.container}>
        <Typography
          component="h1"
          variant="h1"
          color="inherit"
          noWrap
          className={classes.title}
        >
          Bienvenue {practitioner.name}
        </Typography>
      </Container>
      <Container maxWidth="lg" className={classes.container}>
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
              <FavResearch />
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={classes.paper}>
              <LastResearch />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  )
}

export default Accueil
