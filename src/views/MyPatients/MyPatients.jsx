import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSelector, useDispatch } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Link, Route, Switch, useParams } from 'react-router-dom'

import TopBar from '../../components/TopBar/TopBar'
import CohortPreview from '../../components/Cohort/Preview/Preview'
import PatientList from '../../components/Cohort/PatientList/PatientList'
import CohortDocuments from '../../components/Cohort/Documents/Documents'

import useStyles from './style'
import { CircularProgress } from '@material-ui/core'
import { fetchMyPatients } from '../../services/myPatients'

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

const MyPatients = (props) => {
  const { tabName } = useParams()
  const [selectedTab, selectTab] = useState(tabName || 'apercu')
  const dispatch = useDispatch()
  const classes = useStyles()
  const [loading, setLoading] = useState(true)

  const [deidentifiedBoolean, setDeidentifiedBoolean] = useState(true)

  const open = useSelector((state) => state.drawer)
  const myPatients = useSelector((state) => state.exploredCohort)

  useEffect(() => {
    selectTab(tabName || 'apercu')
  }, [tabName])

  useEffect(() => {
    fetchMyPatients()
      .then(
        ({
          patientsTotal,
          patientsList,
          patientsFacets,
          encountersFacets,
          totalDocs,
          docsList,
          // wordcloudData
        }) => {
          dispatch(setCohort({ name: '-' }))
          dispatch(setTotalPatients(patientsTotal))
          dispatch(setOriginalPatients(patientsList))
          dispatch(setPatientsFacets(patientsFacets))
          dispatch(setEncountersFacets(encountersFacets))
          dispatch(setTotalDocs(totalDocs))
          dispatch(setDocumentsList(docsList))
          // dispatch(setWordcloudData(wordcloudData))
          setDeidentifiedBoolean(
            patientsList[0].extension.filter(
              (data) => (data.url = 'deidentified')
            )[0].valueBoolean
          )
        }
      )
      .then(() => setLoading(false))
  }, [])

  return !loading ? (
    <Grid
      container
      direction="column"
      position="fixed"
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <TopBar
        title={myPatients.cohort.name}
        status="Exploration de population"
        patientsNb={myPatients.totalPatients}
        access={deidentifiedBoolean ? 'Pseudonymisé' : 'Nominatif'}
      />
      <Grid container justify="center" className={classes.tabs}>
        <Grid container item xs={11}>
          <Tabs value={selectedTab} classes={{ indicator: classes.indicator }}>
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Aperçu"
              value="apercu"
              component={Link}
              to={'/mes_patients/apercu'}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Patients"
              value="patients"
              component={Link}
              to={'/mes_patients/patients'}
            />
            <Tab
              classes={{ selected: classes.selected }}
              className={classes.tabTitle}
              label="Documents"
              value="documents"
              component={Link}
              to={'/mes_patients/documents'}
            />
          </Tabs>
        </Grid>
      </Grid>
      <div>
        <Switch>
          <Route path={'/mes_patients/apercu'}>
            <CohortPreview
              total={myPatients.totalPatients}
              group={{
                name: 'Mes patients'
              }}
              patientsFacets={myPatients.patientsFacets}
              encountersFacets={myPatients.encountersFacets}
            />
          </Route>
          <Route path={'/mes_patients/patients'}>
            <PatientList
              total={myPatients.totalPatients}
              deidentified={deidentifiedBoolean}
              patients={myPatients.originalPatients}
              patientsFacets={myPatients.patientsFacets}
            />
          </Route>
          <Route path={'/mes_patients/documents'}>
            <CohortDocuments
              total={myPatients.totalDocs}
              docs={myPatients.documentsList}
              // wordcloud={myPatients.wordcloudData}
            />
          </Route>
          <Route path={'/mes_patients'}>
            <CohortPreview
              total={myPatients.totalPatients}
              group={{
                name: 'Mes patients'
              }}
              patientsFacets={myPatients.patientsFacets}
              encountersFacets={myPatients.encountersFacets}
            />
          </Route>
        </Switch>
      </div>
    </Grid>
  ) : (
    <div>
      <CircularProgress className={classes.loading} size={50} />
    </div>
  )
}

export default MyPatients
