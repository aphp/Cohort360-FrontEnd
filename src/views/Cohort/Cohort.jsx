import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useDispatch, useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Link, Route, Switch, useParams } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import Alert from '@material-ui/lab/Alert'

import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'
import TopBar from '../../components/TopBar/TopBar'

import { fetchCohort } from '../../services/cohortInfos'
import {
  setCohort,
  setTotalPatients,
  setOriginalPatients,
  setTotalDocs,
  setDocumentsList,
  setPatientsFacets,
  setEncountersFacets,
  // setWordcloudData
} from '../../state/exploredCohort'

import useStyles from './style'

const Cohort = () => {
  const { cohortId, tabName } = useParams()

  const dispatch = useDispatch()
  const open = useSelector((state) => state.drawer)
  const cohort = useSelector((state) => state.exploredCohort)

  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const [loading, setLoading] = useState(true)
  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState(true)

  // Update cohort
  useEffect(() => {
    fetchCohort(cohortId)
      .then(
        ({
          cohortInfos,
          totalPatients,
          patientsList,
          patientsFacets,
          encountersFacets,
          totalDocs,
          docsList,
          // wordcloudData
        }) => {
          dispatch(setCohort(cohortInfos))
          dispatch(setTotalPatients(totalPatients))
          dispatch(setTotalDocs(totalDocs))
          dispatch(setOriginalPatients(patientsList))
          dispatch(setPatientsFacets(patientsFacets))
          dispatch(setEncountersFacets(encountersFacets))
          dispatch(setDocumentsList(docsList))
          // dispatch(setWordcloudData(wordcloudData))
          if (patientsList[0]) {
            setDeidentifiedBoolean(
              patientsList[0].extension.filter(
                (data) => (data.url = 'deidentified')
              )[0].valueBoolean
            )
          }
        }
      )
      .then(() => setLoading(false))
  }, [cohortId])

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  const classes = useStyles()

  return !loading ? (
    cohort.cohort ? (
      <Grid
        container
        direction="column"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <TopBar
          title={cohort.cohort.name}
          status="Exploration de cohorte"
          patientsNb={cohort.totalPatients || 0}
          access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
          fav
        />
        <Grid container justify="center" className={classes.tabs}>
          <Grid container item xs={11}>
            <Tabs
              value={selectedTab}
              classes={{ indicator: classes.indicator }}
            >
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Aperçu cohorte"
                value="apercu"
                component={Link}
                to={`/cohort/${cohortId}/apercu`}
              />
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Patients"
                value="patients"
                component={Link}
                to={`/cohort/${cohortId}/patients`}
              />
              <Tab
                classes={{ selected: classes.selected }}
                className={classes.tabTitle}
                label="Documents"
                value="documents"
                component={Link}
                to={`/cohort/${cohortId}/documents`}
              />
            </Tabs>
          </Grid>
        </Grid>
        <div>
          {cohort.originalPatients && (
            <Switch>
              <Route path={`/cohort/${cohortId}/apercu`}>
                <CohortPreview
                  total={cohort.totalPatients}
                  group={cohort.cohort}
                  patientsFacets={cohort.patientsFacets}
                  encountersFacets={cohort.encountersFacets}
                />
              </Route>
              <Route path={`/cohort/${cohortId}/patients`}>
                <PatientList
                  groupId={cohortId}
                  total={cohort.totalPatients}
                  deidentified={deidentifiedBoolean}
                  patients={cohort.originalPatients}
                  patientsFacets={cohort.patientsFacets}
                />
              </Route>
              <Route path={`/cohort/${cohortId}/documents`}>
                <CohortDocuments
                  total={cohort.totalDocs}
                  groupId={cohortId}
                  docs={cohort.documentsList}
                  // wordcloud={cohort.wordcloudData}
                />
              </Route>
              <Route path={`/cohort/${cohortId}`}>
                <CohortPreview
                  total={cohort.totalPatients}
                  group={cohort.cohort}
                  patientsFacets={cohort.patientsFacets}
                  encountersFacets={cohort.encountersFacets}
                />
              </Route>
            </Switch>
          )}
        </div>
      </Grid>
    ) : (
      <Alert severity="error" className={classes.alert}>
        Les données ne sont pas encore disponibles, veuillez réessayer
        ultérieurement.
      </Alert>
    )
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default Cohort
